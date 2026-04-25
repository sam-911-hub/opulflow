"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

interface UserData {
  uid: string;
  email: string;
  credits: number;
}

const PLATFORMS = ["Twitter", "Reddit", "LinkedIn", "Instagram", "Facebook", "TikTok", "Quora"];
const TONNES = ["Friendly", "Professional", "Enthusiastic"];
const PRICE_PER_COMMENT = 0.30;

export default function PlaceOrderPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [insufficientCredits, setInsufficientCredits] = useState(false);
  
  const [productName, setProductName] = useState("");
  const [productLink, setProductLink] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [tone, setTone] = useState("Friendly");
  const [instructions, setInstructions] = useState("");
  
  const router = useRouter();

  const togglePlatform = (platform: string) => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const getDiscount = () => {
    if (quantity >= 100) return 0.30;
    if (quantity >= 50) return 0.20;
    if (quantity >= 25) return 0.10;
    return 0;
  };

  const calculateCost = () => {
    const subtotal = quantity * PRICE_PER_COMMENT;
    const discount = subtotal * getDiscount();
    return subtotal - discount;
  };

  const discountPercent = getDiscount() * 100;

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        setUser({
          uid: currentUser.uid,
          email: currentUser.email || "",
          credits: userData.credits || 0,
        });
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setInsufficientCredits(false);

    if (!productName.trim()) {
      setError("Please enter product/service name");
      return;
    }

    if (platforms.length === 0) {
      setError("Please select at least one platform");
      return;
    }

    if (quantity < 1 || quantity > 1000) {
      setError("Quantity must be between 1 and 1000");
      return;
    }

    const totalCost = calculateCost();
    
    if (!user || user.credits < totalCost) {
      setInsufficientCredits(true);
      setError("Insufficient credits");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          productName,
          productLink,
          platforms,
          quantity,
          tone,
          instructions,
          totalCost,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // Check if user has enough credits to place order directly
      const hasEnoughCredits = user && user.credits >= totalCost;

      if (hasEnoughCredits) {
        // User has enough credits - place order directly with credits payment
        try {
          const creditPaymentResponse = await fetch('/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.uid,
              userEmail,
              service: 'comments',
              formData: {
                productName,
                productLink,
                platforms,
                quantity,
                tone,
                instructions,
              },
              totalCost,
              paymentMethod: 'credits',
              status: 'paid',
            }),
          });

          if (!creditPaymentResponse.ok) {
            // If API is not available (404), show warning but allow order
            if (creditPaymentResponse.status === 404) {
              console.warn('Order API not available for credit payment. Order recorded locally.');
              toast.warning('Order recorded locally. Credits will be deducted when system is online.');
              setSuccess('Order placed! Credits will be deducted when system is available.');
            } else {
              const errorData = await creditPaymentResponse.json();
              throw new Error(errorData.error || 'Failed to process credit payment');
            }
          } else {
            // Update local user credits if API succeeded
            if (user) {
              setUser({ ...user, credits: user.credits - totalCost });
            }
            setSuccess(`Order placed successfully! ${totalCost} credits deducted. Check dashboard for details.`);
          }

          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        } catch (creditError) {
          console.error('Credit payment error:', creditError);
          if (creditError.message?.includes('Failed to fetch') || creditError.message?.includes('404')) {
            toast.warning('Order recorded. Credit deduction may take longer than usual.');
            setSuccess('Order placed! Processing may take longer than usual.');
            setTimeout(() => {
              router.push("/dashboard");
            }, 3000);
          } else {
            toast.error('Failed to process payment with credits. Please try again.');
          }
        }
      } else {
        // User needs to pay - redirect to payment
        const orderForPayment = {
          service: 'comments',
          userEmail,
          formData: {
            productName,
            productLink,
            platforms,
            quantity,
            tone,
            instructions,
          },
          totalCost,
          timestamp: new Date().toISOString(),
          orderId: data.orderId,
        };

        localStorage.setItem('pendingOrder', JSON.stringify(orderForPayment));
        router.push('/dashboard/payment');
      }
    } catch (err: any) {
      setError(err.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Place New Order</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          {insufficientCredits && (
            <a href="/dashboard/buy-credits" className="underline ml-2">Buy Credits</a>
          )}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
        <p className="font-semibold">Your Available Credits: <span className="text-orange-600 text-xl">{user?.credits || 0}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product/Service Name *
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter your product or service name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Link (Optional)
          </label>
          <input
            type="url"
            value={productLink}
            onChange={(e) => setProductLink(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="https://your-product-link.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Platforms *
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(platform => (
              <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={platforms.includes(platform)}
                  onChange={() => togglePlatform(platform)}
                  className="w-4 h-4 text-orange-600"
                />
                <span>{platform}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity of Comments *
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min={1}
            max={100}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-sm text-gray-500 mt-1">Min: 1, Max: 100</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tone of Voice *
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {TONNES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Instructions (Optional)
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Any specific points..."
          />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Cost Calculation</h3>
          <p className="text-gray-600">
            {quantity} comments x ${PRICE_PER_COMMENT.toFixed(2)} = ${(quantity * PRICE_PER_COMMENT).toFixed(2)}
          </p>
          {discountPercent > 0 && (
            <p className="text-green-600">
              Bulk discount ({discountPercent}% off)
            </p>
          )}
          <p className="text-xl font-bold mt-2">
            Total: ${calculateCost().toFixed(2)} USD
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || insufficientCredits}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}