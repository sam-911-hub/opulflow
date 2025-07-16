"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Link href="/help" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← Back to Help
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Billing & Credits</h1>
          <p className="text-xl text-gray-600 mb-2">
            Understanding OpulFlow's pay-as-you-go pricing model
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Credit System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>OpulFlow uses a credit-based system that allows you to pay only for what you use:</p>
              
              <div className="space-y-2">
                <h3 className="font-semibold">How Credits Work</h3>
                <p className="text-gray-600">Credits are used to access various services on the platform. Each service costs a specific number of credits:</p>
                <ul className="list-disc pl-5 text-gray-600">
                  <li>Lead Lookup: 1 credit per lead ($0.25)</li>
                  <li>Company Enrichment: 1 credit per company ($0.35)</li>
                  <li>Email Verification: 1 credit per email ($0.05)</li>
                  <li>AI Email Generation: 1 credit per email ($0.10)</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Credit Expiration</h3>
                <p className="text-gray-600">Credits expire 90 days after purchase. This policy helps us maintain our infrastructure and ensure service quality.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Minimum Purchase</h3>
                <p className="text-gray-600">The minimum credit purchase is $10 to avoid micro-transaction fees.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>OpulFlow accepts the following payment methods:</p>
              
              <div className="space-y-2">
                <h3 className="font-semibold">PayPal</h3>
                <p className="text-gray-600">We accept all major credit cards through PayPal. You don't need a PayPal account to make a purchase.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">M-PESA</h3>
                <p className="text-gray-600">For customers in East Africa, we accept M-PESA mobile payments in KES, UGX, TZS, and NGN.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Refund Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">No Refunds for Used Credits</h3>
                <p className="text-gray-600">We do not offer refunds for credits that have been used.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Unused Credits</h3>
                <p className="text-gray-600">Unused credits expire after 90 days and are non-refundable.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Exceptional Circumstances</h3>
                <p className="text-gray-600">In exceptional circumstances, we may consider refunds on a case-by-case basis. Please contact our support team.</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">Have questions about billing?</p>
            <p className="mt-2">
              <a href="mailto:opulflow.inc@gmail.com" className="text-indigo-600 hover:text-indigo-800">
                Contact our billing team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}