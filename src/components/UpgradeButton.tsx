"use client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const PAYPAL_CLIENT_ID = "AXKMvF2VGyq2UZL8vSwQKDZRpQTi_g_YlqoH7HacsiFlcP8HKSJEJci4i6baXOvY1gQV3CqsmfKL0--S";

export default function UpgradeButton() {
  const { user } = useAuth();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);
  
  console.log('UpgradeButton render:', {
    user: !!user,
    clientId: PAYPAL_CLIENT_ID,
    scriptLoaded,
    loadTimeout
  });



  const handleApprove = async () => {
    try {
      await updateDoc(doc(db, "users", user!.uid), {
        accountType: "pro",
        upgradedAt: new Date().toISOString(),
      });
      toast.success("Upgraded to Pro successfully!");
      window.location.reload();
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error("Upgrade failed");
    }
  };

  if (!PAYPAL_CLIENT_ID) {
    return (
      <div className="p-4 border border-red-200 rounded">
        <p className="text-red-600">PayPal Client ID not configured</p>
      </div>
    );
  }

  const handleDirectUpgrade = async () => {
    if (confirm('Upgrade to Pro for $29? (Demo mode - no payment required)')) {
      try {
        await updateDoc(doc(db, "users", user!.uid), {
          accountType: "pro",
          upgradedAt: new Date().toISOString(),
        });
        toast.success("Upgraded to Pro successfully!");
        window.location.reload();
      } catch (error) {
        console.error('Upgrade error:', error);
        toast.error("Upgrade failed");
      }
    }
  };

  if (loadTimeout) {
    return (
      <div className="p-4 border border-yellow-200 rounded">
        <p className="text-yellow-700 mb-2">PayPal unavailable</p>
        <button 
          onClick={handleDirectUpgrade}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
        >
          Upgrade Now (Demo)
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry PayPal
        </button>
      </div>
    );
  }

  return (
    <PayPalScriptProvider 
      options={{ 
        clientId: PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture"
      }}
    >
      <PayPalButtons
        style={{ 
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "paypal"
        }}
        createOrder={(data, actions) => {
          console.log('PayPal createOrder called');
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [{
              amount: {
                currency_code: "USD",
                value: "29.00"
              },
              description: "OpulFlow Pro Upgrade"
            }]
          });
        }}
        onApprove={async (data, actions) => {
          console.log('PayPal onApprove called');
          try {
            const details = await actions.order!.capture();
            console.log('Payment captured:', details);
            await handleApprove();
          } catch (error) {
            console.error('Payment capture error:', error);
            toast.error('Payment processing failed');
          }
        }}
        onError={(err) => {
          console.error('PayPal error:', err);
          toast.error('Payment failed');
        }}
        onCancel={() => {
          console.log('Payment cancelled');
          toast.info('Payment cancelled');
        }}
      />
    </PayPalScriptProvider>
  );
}