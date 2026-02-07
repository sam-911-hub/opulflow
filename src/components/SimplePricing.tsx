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
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-200 shadow-lg">
        <h3 className="text-lg font-semibold text-orange-800 mb-2">Pay-As-You-Go Pricing</h3>
        <p className="text-orange-700">Only pay for what you use. No subscriptions, no lock-in.</p>
        <p className="text-orange-600 text-sm mt-2 font-medium">Save 50-70% vs. competitors' forced subscriptions</p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Core Services</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse modern-card">
            <thead>
              <tr className="bg-gradient-to-r from-orange-100 to-amber-100">
                <th className="p-4 text-left font-semibold text-orange-900">Service</th>
                <th className="p-4 text-right font-semibold text-orange-900">Price</th>
                <th className="p-4 text-right font-semibold text-orange-900">Competitor Price</th>
                <th className="p-4 text-right font-semibold text-orange-900">Your Savings</th>
              </tr>
            </thead>
            <tbody>
              {coreServices.map((service, index) => (
                <tr key={service.key} className={`border-t border-orange-200 hover:bg-orange-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-orange-25'}`}>
                  <td className="p-4">
                    <div className="font-medium text-orange-900">{service.description}</div>
                  </td>
                  <td className="p-4 text-right font-medium text-orange-800">${service.price.toFixed(2)}</td>
                  <td className="p-4 text-right text-orange-600">${(service.price * 2).toFixed(2)}</td>
                  <td className="p-4 text-right text-green-600 font-medium">50%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="modern-card glass-effect hover:scale-105 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <CardTitle>CRM Light</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {crmServices.map((service) => (
                <div key={service.key} className="flex justify-between items-center py-2">
                  <span className="text-orange-900">{service.description}</span>
                  <span className="font-medium text-orange-700">${service.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-6 pt-4 border-t border-orange-200">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-orange-900">Bundle Price</span>
                  <span className="text-orange-600 text-lg">$20.00/month</span>
                </div>
                <div className="text-sm text-orange-600 mt-2">
                  Unlimited leads + 5 pipelines + 10 reports
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="modern-card glass-effect hover:scale-105 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
            <CardTitle>Email Automation</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {emailServices.map((service) => (
                <div key={service.key} className="flex justify-between items-center py-2">
                  <span className="text-orange-900">{service.description}</span>
                  <span className="font-medium text-orange-700">${service.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-6 pt-4 border-t border-orange-200">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-orange-900">Bundle Price</span>
                  <span className="text-orange-600 text-lg">$50.00</span>
                </div>
                <div className="text-sm text-orange-600 mt-2">
                  500 emails + tracking + personalization
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="modern-card glass-effect hover:scale-105 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-700 to-amber-700 text-white">
            <CardTitle>AI Lead Scoring</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {leadScoringServices.map((service) => (
                <div key={service.key} className="flex justify-between items-center py-2">
                  <span className="text-orange-900">{service.description}</span>
                  <span className="font-medium text-orange-700">${service.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-6 pt-4 border-t border-orange-200">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-orange-900">Bundle Price</span>
                  <span className="text-orange-600 text-lg">$100.00</span>
                </div>
                <div className="text-sm text-orange-600 mt-2">
                  Score 1,000 leads (all signals)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="modern-card glass-effect hover:scale-105 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-800 to-amber-800 text-white">
            <CardTitle>AI Sales Coach</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {aiCoachServices.map((service) => (
                <div key={service.key} className="flex justify-between items-center py-2">
                  <span className="text-orange-900">{service.description}</span>
                  <span className="font-medium text-orange-700">${service.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-6 pt-4 border-t border-orange-200">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-orange-900">Bundle Price</span>
                  <span className="text-orange-600 text-lg">$30.00/month</span>
                </div>
                <div className="text-sm text-orange-600 mt-2">
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
          className="gradient-primary text-white px-10 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          Buy your first credit pack in 2 minutes
        </Button>
      </div>
    </div>
  );
}