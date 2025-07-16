"use client";
import { SERVICE_PRICING } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function ServicePricing() {
  const router = useRouter();
  
  // Group services by category
  const coreServices = Object.entries(SERVICE_PRICING).filter(([key]) => 
    ['lead_lookup', 'company_enrichment', 'email_verification', 'ai_email', 'workflow', 'crm_sync'].includes(key)
  );
  
  const crmServices = Object.entries(SERVICE_PRICING).filter(([key]) => 
    ['lead_tracking', 'pipeline', 'report'].includes(key)
  );
  
  const emailServices = Object.entries(SERVICE_PRICING).filter(([key]) => 
    ['email_personalization', 'email_sequence', 'email_tracking'].includes(key)
  );
  
  const leadScoringServices = Object.entries(SERVICE_PRICING).filter(([key]) => 
    ['tech_detection', 'intent_signals', 'lead_ranking'].includes(key)
  );
  
  const aiCoachServices = Object.entries(SERVICE_PRICING).filter(([key]) => 
    ['script_help', 'call_analysis'].includes(key)
  );
  
  const analyticsServices = Object.entries(SERVICE_PRICING).filter(([key]) => 
    ['source_tracking', 'roi_report'].includes(key)
  );

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
              {coreServices.map(([key, service]) => (
                <tr key={key} className="border-t">
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
              {crmServices.map(([key, service]) => (
                <div key={key} className="flex justify-between items-center">
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
              {emailServices.map(([key, service]) => (
                <div key={key} className="flex justify-between items-center">
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
              {leadScoringServices.map(([key, service]) => (
                <div key={key} className="flex justify-between items-center">
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
              {aiCoachServices.map(([key, service]) => (
                <div key={key} className="flex justify-between items-center">
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