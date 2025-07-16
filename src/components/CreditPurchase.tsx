"use client";
import { creditPackages, CreditPackage } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";
import MpesaPayment from "./MpesaPayment";

const PAYPAL_CLIENT_ID = "AXKMvF2VGyq2UZL8vSwQKDZRpQTi_g_YlqoH7HacsiFlcP8HKSJEJci4i6baXOvY1gQV3CqsmfKL0--S";

export default function CreditPurchase() {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'mpesa' | null>(null);

  const handlePaymentSuccess = async (packageItem: CreditPackage) => {
    if (!user) return;

    try {
      // Update user's credit balance
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`credits.${packageItem.type}`]: ((user as any)?.credits?.[packageItem.type] || 0) + packageItem.amount
      });

      // Record transaction
      await addDoc(collection(db, `users/${user.uid}/transactions`), {
        type: "purchase",
        amount: packageItem.amount,
        service: packageItem.type,
        createdAt: new Date().toISOString(),
        remainingBalance: ((user as any)?.credits?.[packageItem.type] || 0) + packageItem.amount
      });

      toast.success(`Successfully purchased ${packageItem.description}!`);
      setSelectedPackage(null);
      window.location.reload();
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error("Failed to process purchase");
    }
  };

  if (selectedPackage && paymentMethod === 'mpesa') {
    return (
      <MpesaPayment
        package={selectedPackage}
        onSuccess={() => handlePaymentSuccess(selectedPackage)}
        onCancel={() => {
          setSelectedPackage(null);
          setPaymentMethod(null);
        }}
      />
    );
  }

  if (selectedPackage && paymentMethod === 'paypal') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complete Purchase - {selectedPackage.description}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <p className="text-lg">{selectedPackage.amount} Credits</p>
            <p className="text-2xl font-bold">${selectedPackage.price}</p>
          </div>
          
          <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD" }}>
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  intent: "CAPTURE",
                  purchase_units: [{
                    amount: {
                      currency_code: "USD",
                      value: selectedPackage.price.toString()
                    },
                    description: selectedPackage.description
                  }]
                });
              }}
              onApprove={async (data, actions) => {
                try {
                  const details = await actions.order!.capture();
                  console.log('Payment successful:', details);
                  await handlePaymentSuccess(selectedPackage);
                } catch (error) {
                  console.error('Payment error:', error);
                  toast.error('Payment failed');
                }
              }}
              onError={(err) => {
                console.error('PayPal error:', err);
                toast.error('Payment failed');
              }}
              onCancel={() => {
                toast.info('Payment cancelled');
                setSelectedPackage(null);
                setPaymentMethod(null);
              }}
            />
          </PayPalScriptProvider>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedPackage(null);
              setPaymentMethod(null);
            }}
            className="w-full mt-4"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (selectedPackage && !paymentMethod) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Choose Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold">{selectedPackage.description}</h3>
            <p className="text-sm text-gray-600">{selectedPackage.amount} Credits</p>
            <p className="text-2xl font-bold">${selectedPackage.price}</p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => setPaymentMethod('paypal')}
              className="w-full flex items-center justify-center gap-2"
            >
              💳 Pay with PayPal
            </Button>
            
            <Button 
              onClick={() => setPaymentMethod('mpesa')}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              📱 Pay with M-PESA
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setSelectedPackage(null)}
            className="w-full mt-4"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buy Credits</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {creditPackages.map((packageItem) => (
          <Card key={packageItem.id}>
            <CardHeader>
              <CardTitle>{packageItem.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{packageItem.amount} Credits</p>
              <p className="text-2xl font-bold">${packageItem.price}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setSelectedPackage(packageItem)}>
                Buy Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}