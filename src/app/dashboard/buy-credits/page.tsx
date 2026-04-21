"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

interface Package {
  credits: number;
  price: number;
  perCredit: number;
  discount: number;
}

const PACKAGES: Package[] = [
  { credits: 10, price: 3.00, perCredit: 0.30, discount: 0 },
  { credits: 25, price: 6.75, perCredit: 0.27, discount: 10 },
  { credits: 50, price: 12.00, perCredit: 0.24, discount: 20 },
  { credits: 100, price: 21.00, perCredit: 0.21, discount: 30 },
];

export default function BuyCreditsPage() {
  const [user, setUser] = useState<{ uid: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser({
        uid: currentUser.uid,
        email: currentUser.email || '',
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handlePaypalClick = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowPaypalModal(true);
  };

  const handleMpesaClick = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowMpesaModal(true);
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
      <h1 className="text-3xl font-bold text-white mb-8">Buy Credits</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {PACKAGES.map((pkg) => (
          <div key={pkg.credits} className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-orange-600 mb-2">{pkg.credits} Credits</h2>
              <p className="text-3xl font-bold mb-2">${pkg.price.toFixed(2)}</p>
              <p className="text-gray-500 text-sm mb-2">${pkg.perCredit.toFixed(2)} each</p>
              {pkg.discount > 0 && (
                <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                  Save {pkg.discount}%
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => handlePaypalClick(pkg)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Pay with PayPal
              </button>
              <button
                onClick={() => handleMpesaClick(pkg)}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Pay with M-PESA
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
        <h2 className="text-xl font-semibold mb-4">How Credit Purchases Work</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Select a credit package above</li>
          <li>Choose your payment method (PayPal or M-PESA)</li>
          <li>Complete the payment following the instructions</li>
          <li>Credits will be added to your account after manual verification</li>
          <li>You'll receive a confirmation once credits are added</li>
        </ol>
      </div>

      {/* PayPal Modal */}
      {showPaypalModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">PayPal Payment</h2>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded">
                <p className="font-medium">Amount: ${selectedPackage.price.toFixed(2)}</p>
                <p className="font-medium">Credits: {selectedPackage.credits}</p>
              </div>
              
              <div>
                <p className="font-medium mb-2">Instructions:</p>
                <ol className="list-decimal list-inside text-sm space-y-1 text-gray-700">
                  <li>Open PayPal and send ${selectedPackage.price.toFixed(2)} to <strong>samuelomondi288@gmail.com</strong></li>
                  <li>In the note/instruction, write:</li>
                  <li className="ml-4 font-mono bg-gray-100 px-2 py-1 rounded">
                    OPULFLOW CREDITS - {user?.email} - {selectedPackage.credits} credits
                  </li>
                  <li>Complete the payment</li>
                  <li>Admin will verify and add credits to your account</li>
                </ol>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowPaypalModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* M-PESA Modal */}
      {showMpesaModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">M-PESA Payment</h2>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded">
                <p className="font-medium">Amount: KES {Math.round(selectedPackage.price * 150)}</p>
                <p className="font-medium">Credits: {selectedPackage.credits}</p>
              </div>
              
              <div>
                <p className="font-medium mb-2">Instructions:</p>
                <ol className="list-decimal list-inside text-sm space-y-1 text-gray-700">
                  <li>Go to M-PESA on your phone</li>
                  <li>Select "Buy Goods and Services"</li>
                  <li>Enter Till Number: <strong>{process.env.NEXT_PUBLIC_MPESA_TILL_NUMBER || 'YOUR_TILL_NUMBER'}</strong></li>
                  <li>Enter Amount: KES {Math.round(selectedPackage.price * 150)}</li>
                  <li>Enter your M-PESA PIN to confirm</li>
                  <li>Note the confirmation code you receive</li>
                  <li>Contact admin with your confirmation code</li>
                </ol>
              </div>

              <div className="bg-yellow-100 p-3 rounded text-sm">
                <p className="font-medium">After payment:</p>
                <p>Contact admin on WhatsApp or email with:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Your email: {user?.email}</li>
                  <li>Credits purchased: {selectedPackage.credits}</li>
                  <li>M-PESA confirmation code</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowMpesaModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}