"use client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Purchase Credits",
      description: "Buy credits for specific services or create a custom package that fits your needs.",
      icon: "💳"
    },
    {
      number: 2,
      title: "Use Services",
      description: "Access lead lookup, company enrichment, AI tools, and more using your credits.",
      icon: "🔍"
    },
    {
      number: 3,
      title: "Track Usage",
      description: "Monitor your credit usage and results in your personalized dashboard.",
      icon: "📊"
    },
    {
      number: 4,
      title: "Grow Your Business",
      description: "Convert insights into action and scale your sales efforts without subscription lock-in.",
      icon: "📈"
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
                <div className="text-3xl mb-2">🔄</div>
                <h3 className="font-bold mb-2">No Subscriptions</h3>
                <p className="text-sm text-gray-600">Pay only for what you use without monthly commitments</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg bg-green-50">
                <div className="text-3xl mb-2">⏱️</div>
                <h3 className="font-bold mb-2">90-Day Credits</h3>
                <p className="text-sm text-gray-600">Credits valid for 90 days from purchase date</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg bg-purple-50">
                <div className="text-3xl mb-2">🌍</div>
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