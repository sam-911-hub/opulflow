"use client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function SimplePricing() {
  const router = useRouter();
  
  // Hardcoded pricing data
  const coreServices = [
    { key: 'lead_lookup', description: 'Lead Lookup', price: 0.25 },
    { key: 'company_enrichment', description: 'Company Enrichment', price: 0.35 },
    { key: 'email_verification', description: 'Email Verification', price: 0.05 },
    { key: 'ai_email', description: 'AI Email Generation', price: 0.10 },
    { key: 'workflow', description: 'Workflow Execution', price: 0.05 },
    { key: 'crm_sync', description: 'CRM Sync Setup', price: 10 }
  ];
  
  const crmServices = [
    { key: 'lead_tracking', description: 'Lead Tracking', price: 0.05 },
    { key: 'pipeline', description: 'Pipeline Management', price: 10 },
    { key: 'report', description: 'Basic Reporting', price: 2 }
  ];
  
  const emailServices = [
    { key: 'email_personalization', description: 'AI Personalization', price: 0.15 },
    { key: 'email_sequence', description: 'Sequence Automation', price: 0.05 },
    { key: 'email_tracking', description: 'Deliverability Tracking', price: 0.10 }
  ];
  
  const leadScoringServices = [
    { key: 'tech_detection', description: 'Tech Stack Detection', price: 0.20 },
    { key: 'intent_signals', description: 'Intent Signals', price: 0.30 },
    { key: 'lead_ranking', description: 'Priority Ranking', price: 0.10 }
  ];
  
  const aiCoachServices = [
    { key: 'script_help', description: 'Script Help', price: 0.25 },
    { key: 'call_analysis', description: 'Call Analysis', price: 0.50 }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Pay-As-You-Go Pricing</h3>
        <p className="text-blue-700">Only pay for what you use. No subscriptions, no lock-in.</p>
        <p className="text-blue-600 text-sm mt-2">Save 50-70% vs. competitors' forced subscriptions</p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Core Services</h3>
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
              {coreServices.map((service) => (
                <tr key={service.key} className="border-t">
                  <td className="p-2">
                    <div className="font-medium">{service.description}</div>
                  </td>
                  <td className="p-2 text-right font-medium">${service.price.toFixed(2)}</td>
                  <td className="p-2 text-right text-gray-500">${(service.price * 2).toFixed(2)}</td>
                  <td className="p-2 text-right text-green-600">50%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CRM Light</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {crmServices.map((service) => (
                <div key={service.key} className="flex justify-between items-center">
                  <span>{service.description}</span>
                  <span className="font-medium">${service.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-4 pt-2 border-t">
                <div className="flex justify-between items-center font-medium">
                  <span>Bundle Price</span>
                  <span className="text-purple-600">$20.00/month</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Unlimited leads + 5 pipelines + 10 reports
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Email Automation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {emailServices.map((service) => (
                <div key={service.key} className="flex justify-between items-center">
                  <span>{service.description}</span>
                  <span className="font-medium">${service.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-4 pt-2 border-t">
                <div className="flex justify-between items-center font-medium">
                  <span>Bundle Price</span>
                  <span className="text-purple-600">$50.00</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  500 emails + tracking + personalization
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Lead Scoring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leadScoringServices.map((service) => (
                <div key={service.key} className="flex justify-between items-center">
                  <span>{service.description}</span>
                  <span className="font-medium">${service.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-4 pt-2 border-t">
                <div className="flex justify-between items-center font-medium">
                  <span>Bundle Price</span>
                  <span className="text-purple-600">$100.00</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Score 1,000 leads (all signals)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Sales Coach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aiCoachServices.map((service) => (
                <div key={service.key} className="flex justify-between items-center">
                  <span>{service.description}</span>
                  <span className="font-medium">${service.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-4 pt-2 border-t">
                <div className="flex justify-between items-center font-medium">
                  <span>Bundle Price</span>
                  <span className="text-purple-600">$30.00/month</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Unlimited queries + 60 mins call analysis
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center mt-8">
        <Button 
          onClick={() => router.push('/dashboard/credits')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
        >
          Buy your first credit pack in 2 minutes
        </Button>
      </div>
    </div>
  );
}