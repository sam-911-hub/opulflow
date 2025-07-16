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
      
      // Handle special case for Power Bundle which includes multiple credit types
      if (packageItem.includes) {
        // Update each credit type included in the bundle
        const updates: Record<string, number> = {};
        
        for (const [creditType, amount] of Object.entries(packageItem.includes)) {
          updates[`credits.${creditType}`] = ((user as any)?.credits?.[creditType] || 0) + amount;
          
          // Record transaction for each credit type
          await addDoc(collection(db, `users/${user.uid}/transactions`), {
            type: "purchase",
            amount: amount,
            service: creditType,
            createdAt: new Date().toISOString(),
            remainingBalance: ((user as any)?.credits?.[creditType] || 0) + amount,
            bundleId: packageItem.id
          });
        }
        
        await updateDoc(userRef, updates);
      } else {
        // Standard single credit type package
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
      }

      toast.success(`Successfully purchased ${packageItem.description}!`);
      setSelectedPackage(null);
      setPaymentMethod(null);
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

  // Group packages by category
  const corePackages = creditPackages.filter(pkg => 
    ['lead_lookup', 'company_enrichment', 'email_verification', 'ai_email', 'workflow'].includes(pkg.type) && 
    !pkg.includes
  );
  
  const bundlePackages = creditPackages.filter(pkg => pkg.includes);
  
  const extensionPackages = creditPackages.filter(pkg => 
    ['extension_access', 'contact_lookup'].includes(pkg.type)
  );

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Pay-As-You-Go Pricing</h3>
        <p className="text-blue-700">Only pay for what you use. No subscriptions, no lock-in. Credits expire after 90 days.</p>
        <p className="text-blue-600 text-sm mt-2">Minimum purchase: $10</p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Core Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {corePackages.map((packageItem) => (
            <Card key={packageItem.id} className="border-t-4 border-t-blue-500">
              <CardHeader>
                <CardTitle>{packageItem.description}</CardTitle>
                <p className="text-sm text-gray-500">{SERVICE_PRICING[packageItem.type].description}</p>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{packageItem.amount} Credits</p>
                <p className="text-2xl font-bold">${packageItem.price}</p>
                <p className="text-sm text-gray-500 mt-1">${(packageItem.price / packageItem.amount).toFixed(2)} per credit</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setSelectedPackage(packageItem)} className="w-full">
                  Buy Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Service Bundles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bundlePackages.map((packageItem) => (
            <Card key={packageItem.id} className="border-t-4 border-t-purple-500">
              <CardHeader>
                <CardTitle>{packageItem.description}</CardTitle>
                <div className="flex items-center">
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">BEST VALUE</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${packageItem.price}</p>
                <div className="mt-2 space-y-1">
                  {packageItem.includes && Object.entries(packageItem.includes).map(([type, amount]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span>{SERVICE_PRICING[type as CreditType].description}:</span>
                      <span className="font-medium">{amount === 1000 ? 'Unlimited' : amount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setSelectedPackage(packageItem)} className="w-full bg-purple-600 hover:bg-purple-700">
                  Buy Bundle
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      {extensionPackages.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Browser Extension</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {extensionPackages.map((packageItem) => (
              <Card key={packageItem.id} className="border-t-4 border-t-green-500">
                <CardHeader>
                  <CardTitle>{packageItem.description}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${packageItem.price}/month</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setSelectedPackage(packageItem)} className="w-full">
                    Subscribe
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}