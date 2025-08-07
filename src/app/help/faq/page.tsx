"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Link href="/help" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← Back to Help
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 mb-2">
            Common questions about OpulFlow's services and pricing
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">What is OpulFlow?</h3>
                <p className="text-gray-600">OpulFlow is a pay-as-you-go sales intelligence platform that provides lead lookup, company enrichment, email verification, AI tools, and workflow automation without subscriptions.</p>
              </div>
              
              <div>
                <h3 className="font-semibold">How does the credit system work?</h3>
                <p className="text-gray-600">You purchase credits that can be used for various services. Each service costs a specific number of credits. Credits expire after 90 days, and there's a $10 minimum purchase.</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Do you offer refunds?</h3>
                <p className="text-gray-600">We do not offer refunds for used credits. Unused credits expire after 90 days.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pricing Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">What's the minimum purchase?</h3>
                <p className="text-gray-600">The minimum purchase is $10 to avoid micro-transaction fees.</p>
              </div>
              
              <div>
                <h3 className="font-semibold">How do bundles work?</h3>
                <p className="text-gray-600">Bundles provide a set of credits for specific services at a discounted rate. For example, the CRM Light Bundle gives you unlimited leads, 5 pipelines, and 10 reports for $20/month.</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Can I share credits with my team?</h3>
                <p className="text-gray-600">Credits are tied to your account, but you can invite team members to collaborate using your credits.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Technical Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">How do I integrate OpulFlow with my CRM?</h3>
                <p className="text-gray-600">You can use our CRM Sync service to connect OpulFlow with popular CRMs like Salesforce, HubSpot, and Pipedrive. This costs $10 per setup.</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Is there an API available?</h3>
                <p className="text-gray-600">Yes, we offer API access for all our services. Check our <Link href="/help/api" className="text-indigo-600 hover:text-indigo-800">API Documentation</Link> for details.</p>
              </div>
              
              <div>
                <h3 className="font-semibold">How accurate is your data?</h3>
                <p className="text-gray-600">Our data is sourced from multiple providers and regularly updated. We maintain a 95%+ accuracy rate for contact information and company data.</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">Still have questions?</p>
            <p className="mt-2">
              <a href="mailto:opulflow.inc@gmail.com" className="text-indigo-600 hover:text-indigo-800">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}