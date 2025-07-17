"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UserManualPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">OpulFlow User Manual</h1>
          <p className="text-xl text-gray-600 mb-2">
            Your guide to our pay-as-you-go sales intelligence platform
          </p>
        </div>

        <Tabs defaultValue="services" className="max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="contact">Contact & Support</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Intelligence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <h3 className="font-semibold">Lead Lookup</h3>
                    <p className="text-sm text-gray-600">Access our database of 50M+ companies and contacts with verified information.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Company Enrichment</h3>
                    <p className="text-sm text-gray-600">Get detailed company data including funding, tech stack, and employee count.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Verification</h3>
                    <p className="text-sm text-gray-600">Verify email deliverability in real-time to improve campaign performance.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <h3 className="font-semibold">AI Email Generation</h3>
                    <p className="text-sm text-gray-600">Create personalized outreach emails using GPT-4 technology.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Script Help</h3>
                    <p className="text-sm text-gray-600">Generate effective sales scripts tailored to your prospect's industry.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Call Analysis</h3>
                    <p className="text-sm text-gray-600">Get AI-powered insights from your sales calls to improve performance.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CRM Light</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <h3 className="font-semibold">Lead Tracking</h3>
                    <p className="text-sm text-gray-600">Organize and track your leads through the sales pipeline.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Pipeline Management</h3>
                    <p className="text-sm text-gray-600">Create custom pipelines to visualize your sales process.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Basic Reporting</h3>
                    <p className="text-sm text-gray-600">Generate reports on your sales activities and performance.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Automation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <h3 className="font-semibold">AI Personalization</h3>
                    <p className="text-sm text-gray-600">Automatically personalize emails at scale for better engagement.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Sequence Automation</h3>
                    <p className="text-sm text-gray-600">Set up multi-step email sequences with timing rules.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Deliverability Tracking</h3>
                    <p className="text-sm text-gray-600">Monitor open rates, clicks, and responses to optimize campaigns.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pay-As-You-Go Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>OpulFlow uses a credit-based system with no subscriptions or commitments:</p>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 text-left">Service</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">Competitor Price</th>
                        <th className="p-2 text-right">Your Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-2">Lead Lookup</td>
                        <td className="p-2 text-right font-medium">$0.25/lead</td>
                        <td className="p-2 text-right text-gray-500">$0.50+/lead</td>
                        <td className="p-2 text-right text-green-600">50%+</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">Company Enrichment</td>
                        <td className="p-2 text-right font-medium">$0.35/profile</td>
                        <td className="p-2 text-right text-gray-500">$0.70+/profile</td>
                        <td className="p-2 text-right text-green-600">50%+</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2">AI Email Generation</td>
                        <td className="p-2 text-right font-medium">$0.10/email</td>
                        <td className="p-2 text-right text-gray-500">$0.30+/email</td>
                        <td className="p-2 text-right text-green-600">67%+</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Financial Safeguards:</h3>
                  <ul className="list-disc pl-5 text-blue-700 text-sm">
                    <li>$10 minimum credit purchase</li>
                    <li>Credits expire after 90 days</li>
                    <li>Non-refundable for used credits</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bundle Offers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-purple-700">CRM Light Bundle</h3>
                    <p className="text-lg font-bold">$20/month</p>
                    <p className="text-sm text-gray-600">Unlimited leads + 5 pipelines + 10 reports</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-purple-700">Email Automation Bundle</h3>
                    <p className="text-lg font-bold">$50</p>
                    <p className="text-sm text-gray-600">500 emails + tracking + personalization</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-purple-700">AI Lead Scoring Bundle</h3>
                    <p className="text-lg font-bold">$100</p>
                    <p className="text-sm text-gray-600">Score 1,000 leads (all signals)</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-purple-700">AI Sales Coach Bundle</h3>
                    <p className="text-lg font-bold">$30/month</p>
                    <p className="text-sm text-gray-600">Unlimited queries + 60 mins call analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-blue-600">opulflow.inc@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Support</h3>
                    <p>Available Monday-Friday, 9am-5pm EST</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <h3 className="font-semibold mb-2">Quick Support Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Link href="/help/faq" className="text-indigo-600 hover:text-indigo-800">
                      Frequently Asked Questions
                    </Link>
                    <Link href="/help/api" className="text-indigo-600 hover:text-indigo-800">
                      API Documentation
                    </Link>
                    <Link href="/help/tutorials" className="text-indigo-600 hover:text-indigo-800">
                      Video Tutorials
                    </Link>
                    <Link href="/help/billing" className="text-indigo-600 hover:text-indigo-800">
                      Billing & Credits
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}