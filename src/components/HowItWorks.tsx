"use client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Purchase Credits",
      description: "Buy credits for specific services or create a custom package that fits your needs.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      number: 2,
      title: "Use Services",
      description: "Access lead lookup, company enrichment, AI tools, and more using your credits.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      number: 3,
      title: "Track Usage",
      description: "Monitor your credit usage and results in your personalized dashboard.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      number: 4,
      title: "Grow Your Business",
      description: "Convert insights into action and scale your sales efforts without subscription lock-in.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
  ];

  return (
    <div className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">How OpulFlow Works</h2>
          <p className="mt-4 text-xl text-gray-600">Simple, transparent, and flexible sales intelligence</p>
        </div>

        {/* Process Diagram */}
        <div className="relative max-w-4xl mx-auto mb-16">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-blue-200 -translate-y-1/2 z-0"></div>
          
          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-2xl mb-4 border-4 border-blue-500">
                  {step.icon}
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-md w-full">
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Model */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Pay-As-You-Go Usage Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg bg-blue-50">
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">No Subscriptions</h3>
                <p className="text-sm text-gray-600">Pay only for what you use without monthly commitments</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg bg-green-50">
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">90-Day Credits</h3>
                <p className="text-sm text-gray-600">Credits valid for 90 days from purchase date</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg bg-purple-50">
                <div className="flex justify-center mb-2">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Multiple Currencies</h3>
                <p className="text-sm text-gray-600">Pay in USD, KES, UGX, TZS, or NGN</p>
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <h3 className="font-bold text-lg mb-4 text-center">Credit Usage Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Lead Lookup</span>
                    <span>1 credit</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Find contact information for a potential customer
                  </div>
                </div>
                
                <div className="border p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Company Enrichment</span>
                    <span>1 credit</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Get detailed company data and technographics
                  </div>
                </div>
                
                <div className="border p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">AI Email Generation</span>
                    <span>1 credit</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Create a personalized outreach email
                  </div>
                </div>
                
                <div className="border p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Workflow Automation</span>
                    <span>1 credit</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Run an automated sales workflow
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}