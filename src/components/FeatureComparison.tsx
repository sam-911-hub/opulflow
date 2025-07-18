"use client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Check, X } from "lucide-react";

export default function FeatureComparison() {
  const features = [
    {
      category: "Lead Intelligence",
      items: [
        {
          name: "Lead Lookup",
          description: "Find contact information for potential customers",
          competitors: {
            opulflow: { available: true, price: "$0.25/lead" },
            competitor1: { available: true, price: "$0.50/lead" },
            competitor2: { available: true, price: "$0.75/lead" }
          }
        },
        {
          name: "Company Enrichment",
          description: "Get detailed company data and technographics",
          competitors: {
            opulflow: { available: true, price: "$0.35/company" },
            competitor1: { available: true, price: "$0.70/company" },
            competitor2: { available: true, price: "$0.80/company" }
          }
        },
        {
          name: "Email Verification",
          description: "Verify email deliverability in real-time",
          competitors: {
            opulflow: { available: true, price: "$0.05/email" },
            competitor1: { available: true, price: "$0.10/email" },
            competitor2: { available: true, price: "$0.15/email" }
          }
        }
      ]
    },
    {
      category: "AI Tools",
      items: [
        {
          name: "Email Generation",
          description: "Create personalized outreach emails with AI",
          competitors: {
            opulflow: { available: true, price: "$0.10/email" },
            competitor1: { available: true, price: "$0.30/email" },
            competitor2: { available: false, price: "N/A" }
          }
        },
        {
          name: "Call Scripts",
          description: "Generate effective sales call scripts",
          competitors: {
            opulflow: { available: true, price: "$0.25/script" },
            competitor1: { available: false, price: "N/A" },
            competitor2: { available: true, price: "$0.50/script" }
          }
        },
        {
          name: "Sales Coaching",
          description: "AI-powered feedback on sales calls",
          competitors: {
            opulflow: { available: true, price: "$0.50/analysis" },
            competitor1: { available: true, price: "$1.00/analysis" },
            competitor2: { available: false, price: "N/A" }
          }
        }
      ]
    },
    {
      category: "Workflow & Automation",
      items: [
        {
          name: "Custom Workflows",
          description: "Create and run custom sales workflows",
          competitors: {
            opulflow: { available: true, price: "$0.05/run" },
            competitor1: { available: true, price: "$0.10/run" },
            competitor2: { available: false, price: "N/A" }
          }
        },
        {
          name: "Email Sequences",
          description: "Set up automated email sequences",
          competitors: {
            opulflow: { available: true, price: "$0.05/email" },
            competitor1: { available: true, price: "Subscription only" },
            competitor2: { available: true, price: "Subscription only" }
          }
        },
        {
          name: "CRM Integration",
          description: "Sync data with popular CRM systems",
          competitors: {
            opulflow: { available: true, price: "$10/setup" },
            competitor1: { available: true, price: "Subscription only" },
            competitor2: { available: true, price: "Subscription only" }
          }
        }
      ]
    },
    {
      category: "Pricing Model",
      items: [
        {
          name: "Pay-As-You-Go",
          description: "Pay only for what you use",
          competitors: {
            opulflow: { available: true, price: "✓" },
            competitor1: { available: false, price: "✗" },
            competitor2: { available: false, price: "✗" }
          }
        },
        {
          name: "No Subscription Required",
          description: "Use without monthly commitments",
          competitors: {
            opulflow: { available: true, price: "✓" },
            competitor1: { available: false, price: "✗" },
            competitor2: { available: false, price: "✗" }
          }
        },
        {
          name: "Custom Credit Purchase",
          description: "Buy exactly the number of credits you need",
          competitors: {
            opulflow: { available: true, price: "✓" },
            competitor1: { available: false, price: "✗" },
            competitor2: { available: false, price: "✗" }
          }
        },
        {
          name: "Multiple Currency Support",
          description: "Pay in your local currency",
          competitors: {
            opulflow: { available: true, price: "5 currencies" },
            competitor1: { available: true, price: "USD only" },
            competitor2: { available: false, price: "USD only" }
          }
        }
      ]
    }
  ];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Feature Comparison</h2>
          <p className="mt-4 text-xl text-gray-600">See how OpulFlow compares to competitors</p>
        </div>

        <div className="space-y-8">
          {features.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle>{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 w-1/4">Feature</th>
                        <th className="text-left p-2 w-1/4">Description</th>
                        <th className="text-center p-2 bg-blue-50 w-1/6">
                          <div className="font-bold">OpulFlow</div>
                          <div className="text-xs text-blue-600">Pay-As-You-Go</div>
                        </th>
                        <th className="text-center p-2 w-1/6">
                          <div className="font-bold">Competitor A</div>
                          <div className="text-xs text-gray-500">Subscription</div>
                        </th>
                        <th className="text-center p-2 w-1/6">
                          <div className="font-bold">Competitor B</div>
                          <div className="text-xs text-gray-500">Subscription</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.items.map((feature, index) => (
                        <tr key={feature.name} className={index < category.items.length - 1 ? "border-b" : ""}>
                          <td className="p-3 font-medium">{feature.name}</td>
                          <td className="p-3 text-sm text-gray-600">{feature.description}</td>
                          <td className="p-3 text-center bg-blue-50">
                            <div className="flex flex-col items-center">
                              {feature.competitors.opulflow.available ? (
                                <Check className="text-green-500 h-5 w-5 mx-auto" />
                              ) : (
                                <X className="text-red-500 h-5 w-5 mx-auto" />
                              )}
                              <span className="text-sm mt-1">{feature.competitors.opulflow.price}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center">
                              {feature.competitors.competitor1.available ? (
                                <Check className="text-green-500 h-5 w-5 mx-auto" />
                              ) : (
                                <X className="text-red-500 h-5 w-5 mx-auto" />
                              )}
                              <span className="text-sm mt-1">{feature.competitors.competitor1.price}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center">
                              {feature.competitors.competitor2.available ? (
                                <Check className="text-green-500 h-5 w-5 mx-auto" />
                              ) : (
                                <X className="text-red-500 h-5 w-5 mx-auto" />
                              )}
                              <span className="text-sm mt-1">{feature.competitors.competitor2.price}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}