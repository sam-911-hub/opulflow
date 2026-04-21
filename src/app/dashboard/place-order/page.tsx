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

  // Calculate discount
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
        router.push('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid);
        const userData = userDoc.exists() ? userDoc.data() : {};

        setUser({
          uid: currentUser.uid,
          email: currentUser.email || '',
          credits: userData.credits || 0,
        });
      } catch (err) {
        console.error('Error:', err);
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

    if (quantity < 1 || quantity > 100) {
      setError("Quantity must be between 1 and 100");
      return;
    }

    const totalCost = calculateCost();
    
    if (!user || user.credits < totalCost) {
      setInsufficientCredits(true);
      setError(`Insufficient credits. You have ${user?.credits || 0} credits but need ${totalCost} credits.`);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          productName,
          platforms,
          quantity,
          tone,
          instructions,
          totalCost,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      setSuccess("Order placed successfully! Check your dashboard for order details.");
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
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

      {/* Credits Display */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
        <p className="font-semibold">Your Available Credits: <span className="text-orange-600 text-xl">{user?.credits || 0}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-6">
        {/* Product Name */}
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

        {/* Platforms */}
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

        {/* Quantity */}
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

        {/* Tone */}
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

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Instructions (Optional)
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Any specific points to mention or avoid..."
          />
        </div>

        {/* Cost Calculation */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Cost Calculation</h3>
          <p className="text-gray-600">
            {quantity} comments × ${PRICE_PER_COMMENT.toFixed(2)} = ${(quantity * PRICE_PER_COMMENT).toFixed(2)}
          </p>
          {discountPercent > 0 && (
            <p className="text-green-600">
              Bulk discount ({discountPercent}% off): -${((quantity * PRICE_PER_COMMENT) * discountPercent / 100).toFixed(2)}
            </p>
          )}
          <p className="text-xl font-bold mt-2">
            Total: ${calculateCost().toFixed(2)} USD
          </p>
          {insufficientCredits && (
            <p className="text-red-600 text-sm mt-1">
              Need {calculateCost()} credits, have {user?.credits || 0}
            </p>
          )}
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