"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { initiateMpesaPayment, checkMpesaPaymentStatus } from "@/lib/mpesa";
import { convertUSDToLocal, formatCurrency } from "@/lib/currency";
import { CreditPackage } from "@/types";

interface MpesaPaymentProps {
  package: CreditPackage;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MpesaPayment({ package: pkg, onSuccess, onCancel }: MpesaPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [loading, setLoading] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState("");

  const localAmount = convertUSDToLocal(pkg.price, currency);

  const handleMpesaPayment = async () => {
    if (!phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }

    setLoading(true);
    try {
      const response = await initiateMpesaPayment({
        phoneNumber,
        amount: localAmount,
        currency,
        description: `OpulFlow ${pkg.description}`,
        callbackUrl: `${window.location.origin}/api/mpesa/callback`
      });

      if (response.success) {
        setPaymentInitiated(true);
        setCheckoutRequestId(response.checkoutRequestId!);
        toast.success(response.message);
        
        // Start polling for payment status
        pollPaymentStatus(response.checkoutRequestId!);
      } else {
        toast.error("Failed to initiate M-PESA payment");
      }
    } catch (error) {
      console.error("M-PESA payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (requestId: string) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const status = await checkMpesaPaymentStatus(requestId);
        
        if (status.status === 'completed') {
          toast.success("Payment successful!");
          onSuccess();
        } else if (status.status === 'failed') {
          toast.error("Payment failed. Please try again.");
          setPaymentInitiated(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        } else {
          toast.error("Payment timeout. Please try again.");
          setPaymentInitiated(false);
        }
      } catch (error) {
        console.error("Status check error:", error);
        setPaymentInitiated(false);
      }
    };

    setTimeout(checkStatus, 5000); // First check after 5 seconds
  };

  if (paymentInitiated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>M-PESA Payment Initiated</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="animate-pulse">
            <div className="text-4xl mb-4">📱</div>
            <p className="text-lg font-medium">Check your phone for M-PESA prompt</p>
            <p className="text-sm text-gray-600">
              Enter your M-PESA PIN to complete the payment
            </p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(localAmount, currency)}
            </p>
          </div>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay with M-PESA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center mb-4">
          <p className="text-lg">{pkg.amount} Credits</p>
          <p className="text-sm text-gray-600">
            ${pkg.price} = {formatCurrency(localAmount, currency)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="KES">Kenyan Shilling (KES)</option>
            <option value="UGX">Ugandan Shilling (UGX)</option>
            <option value="TZS">Tanzanian Shilling (TZS)</option>
            <option value="NGN">Nigerian Naira (NGN)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <Input
            type="tel"
            placeholder="254712345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your M-PESA registered phone number
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleMpesaPayment}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Processing..." : `Pay ${formatCurrency(localAmount, currency)}`}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}