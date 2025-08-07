"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { SERVICE_PRICING } from "@/types";
import { convertUSDToLocal, formatCurrency } from "@/lib/currency";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import MpesaPayment from "./MpesaPayment";

const PAYPAL_CLIENT_ID = "AXKMvF2VGyq2UZL8vSwQKDZRpQTi_g_YlqoH7HacsiFlcP8HKSJEJci4i6baXOvY1gQV3CqsmfKL0--S";

export default function CustomCreditPurchase() {
  const { user } = useAuth();
  const [creditType, setCreditType] = useState<string>("lead_lookup");
  const [quantity, setQuantity] = useState<number>(10);
  const [currency, setCurrency] = useState<string>("USD");
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'mpesa' | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Calculate price based on credit type and quantity
  const unitPrice = SERVICE_PRICING[creditType as keyof typeof SERVICE_PRICING]?.price || 0;
  const totalPrice = unitPrice * quantity;
  const localPrice = convertUSDToLocal(totalPrice, currency);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuantity(isNaN(value) ? 0 : Math.max(1, value));
  };

  const handleCreditTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCreditType(e.target.value);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
  };

  const handlePaymentSuccess = async () => {
    if (!user) {
      toast.error("You need to be logged in");
      return;
    }

    setIsProcessing(true);
    try {
      // Update user's credit balance
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`credits.${creditType}`]: ((user as any)?.credits?.[creditType] || 0) + quantity
      });

      // Record transaction
      await addDoc(collection(db, `users/${user.uid}/transactions`), {
        type: "purchase",
        amount: quantity,
        service: creditType,
        createdAt: new Date().toISOString(),
        remainingBalance: ((user as any)?.credits?.[creditType] || 0) + quantity,
        paymentDetails: {
          packageName: "Custom Credit Purchase",
          serviceType: SERVICE_PRICING[creditType as keyof typeof SERVICE_PRICING]?.description || creditType,
          unitPrice: unitPrice,
          totalPrice: totalPrice,
          paymentMethod: paymentMethod,
          purchaseDate: new Date().toISOString()
        }
      });

      toast.success(`Successfully purchased ${quantity} ${creditType} credits!`);
      setPaymentMethod(null);
      window.location.reload();
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error("Failed to process purchase");
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentMethod === 'mpesa') {
    const packageItem = {
      id: `custom-${creditType}`,
      type: creditType,
      amount: quantity,
      price: totalPrice,
      description: `${quantity} ${SERVICE_PRICING[creditType as keyof typeof SERVICE_PRICING]?.description || creditType} Credits`
    };

    return (
      <MpesaPayment
        package={packageItem}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setPaymentMethod(null)}
      />
    );
  }

  if (paymentMethod === 'paypal') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complete Purchase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <p className="text-lg">{quantity} {SERVICE_PRICING[creditType as keyof typeof SERVICE_PRICING]?.description || creditType} Credits</p>
            <p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
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
                      value: totalPrice.toFixed(2)
                    },
                    description: `${quantity} ${SERVICE_PRICING[creditType as keyof typeof SERVICE_PRICING]?.description || creditType} Credits`
                  }]
                });
              }}
              onApprove={async (data, actions) => {
                try {
                  const details = await actions.order!.capture();
                  console.log('Payment successful:', details);
                  await handlePaymentSuccess();
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
                setPaymentMethod(null);
              }}
            />
          </PayPalScriptProvider>
          
          <Button 
            variant="outline" 
            onClick={() => setPaymentMethod(null)}
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
        <CardTitle>Custom Credit Purchase</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Credit Type</label>
            <select
              value={creditType}
              onChange={handleCreditTypeChange}
              className="w-full p-2 border rounded-md"
            >
              {Object.entries(SERVICE_PRICING).map(([key, service]) => (
                <option key={key} value={key}>
                  {service.description} ({formatCurrency(service.price, "USD")}/credit)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3"
              >
                -
              </Button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="mx-2 text-center"
              />
              <Button 
                variant="outline" 
                onClick={() => setQuantity(quantity + 1)}
                className="px-3"
              >
                +
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="USD">US Dollar (USD)</option>
              <option value="KES">Kenyan Shilling (KES)</option>
              <option value="UGX">Ugandan Shilling (UGX)</option>
              <option value="TZS">Tanzanian Shilling (TZS)</option>
              <option value="NGN">Nigerian Naira (NGN)</option>
            </select>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span>Unit Price:</span>
              <span>{formatCurrency(unitPrice, "USD")} / {formatCurrency(convertUSDToLocal(unitPrice, currency), currency)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-lg mt-2">
              <span>Total:</span>
              <span>{formatCurrency(totalPrice, "USD")} / {formatCurrency(localPrice, currency)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          onClick={() => setPaymentMethod('paypal')}
          className="w-full"
          disabled={quantity < 1 || isProcessing}
        >
          Pay with PayPal
        </Button>
        <Button 
          onClick={() => setPaymentMethod('mpesa')}
          variant="outline"
          className="w-full"
          disabled={quantity < 1 || isProcessing}
        >
          Pay with M-PESA
        </Button>
      </CardFooter>
    </Card>
  );
}