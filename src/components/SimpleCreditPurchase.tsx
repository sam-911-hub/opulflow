"use client";
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

// Hardcoded credit packages
const creditPackages = [
  {
    id: 'starter-pack',
    type: 'lead_lookup',
    amount: 40,
    price: 10,
    description: 'Starter Pack',
    serviceDescription: 'Lead Lookup'
  },
  {
    id: 'lead-explorer',
    type: 'lead_lookup',
    amount: 200,
    price: 45,
    description: 'Lead Explorer',
    serviceDescription: 'Lead Lookup'
  },
  {
    id: 'enrichment-pack',
    type: 'company_enrichment',
    amount: 100,
    price: 30,
    description: 'Enrichment Pack',
    serviceDescription: 'Company Enrichment'
  },
  {
    id: 'email-verification',
    type: 'email_verification',
    amount: 1000,
    price: 45,
    description: 'Email Verification',
    serviceDescription: 'Email Verification'
  },
  {
    id: 'ai-writer',
    type: 'ai_email',
    amount: 200,
    price: 20,
    description: 'AI Email Writer',
    serviceDescription: 'AI Email Generation'
  }
];

// Bundle packages
const bundlePackages = [
  {
    id: 'crm-light-bundle',
    type: 'bundle',
    amount: 1,
    price: 20,
    description: 'CRM Light Bundle',
    includes: {
      lead_tracking: { amount: 1000, description: 'Lead Tracking' },
      pipeline: { amount: 5, description: 'Pipeline Management' },
      report: { amount: 10, description: 'Basic Reporting' }
    }
  },
  {
    id: 'email-bundle',
    type: 'bundle',
    amount: 1,
    price: 50,
    description: 'Email Automation Bundle',
    includes: {
      email_personalization: { amount: 500, description: 'AI Personalization' },
      email_sequence: { amount: 500, description: 'Sequence Automation' },
      email_tracking: { amount: 500, description: 'Deliverability Tracking' }
    }
  }
];

export default function SimpleCreditPurchase() {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'mpesa' | null>(null);

  const handlePaymentSuccess = async (packageItem: any) => {
    if (!user) return;

    try {
      // Update user's credit balance
      const userRef = doc(db, "users", user.uid);
      
      // Handle special case for bundles which include multiple credit types
      if (packageItem.includes) {
        // Update each credit type included in the bundle
        const updates: Record<string, number> = {};
        
        for (const [creditType, details] of Object.entries(packageItem.includes)) {
          const amount = (details as any).amount;
          updates[`credits.${creditType}`] = ((user as any)?.credits?.[creditType] || 0) + amount;
          
          // Record transaction for each credit type
          await addDoc(collection(db, `users/${user.uid}/transactions`), {
            type: "purchase",
            amount: amount,
            service: creditType,
            createdAt: new Date().toISOString(),
            remainingBalance: ((user as any)?.credits?.[creditType] || 0) + amount,
            bundleId: packageItem.id,
            // Enhanced payment details
            paymentDetails: {
              packageName: packageItem.description,
              serviceType: (details as any).description,
              unitPrice: packageItem.price / Object.keys(packageItem.includes).length,
              totalPrice: packageItem.price,
              paymentMethod: paymentMethod,
              purchaseDate: new Date().toISOString()
            }
          });
        }
        
        await updateDoc(userRef, updates);
      } else {
        // Standard single credit type package
        await updateDoc(userRef, {
          [`credits.${packageItem.type}`]: ((user as any)?.credits?.[packageItem.type] || 0) + packageItem.amount
        });

        // Record transaction with enhanced payment details
        await addDoc(collection(db, `users/${user.uid}/transactions`), {
          type: "purchase",
          amount: packageItem.amount,
          service: packageItem.type,
          createdAt: new Date().toISOString(),
          remainingBalance: ((user as any)?.credits?.[packageItem.type] || 0) + packageItem.amount,
          // Enhanced payment details
          paymentDetails: {
            packageName: packageItem.description,
            serviceType: packageItem.serviceDescription,
            unitPrice: packageItem.price / packageItem.amount,
            totalPrice: packageItem.price,
            paymentMethod: paymentMethod,
            purchaseDate: new Date().toISOString()
          }
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
          {creditPackages.map((packageItem) => (
            <Card key={packageItem.id} className="border-t-4 border-t-blue-500">
              <CardHeader>
                <CardTitle>{packageItem.description}</CardTitle>
                <p className="text-sm text-gray-500">{packageItem.serviceDescription}</p>
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
                  {packageItem.includes && Object.entries(packageItem.includes).map(([type, details]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span>{(details as any).description}:</span>
                      <span className="font-medium">{(details as any).amount === 1000 ? 'Unlimited' : (details as any).amount}</span>
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
    </div>
  );
}