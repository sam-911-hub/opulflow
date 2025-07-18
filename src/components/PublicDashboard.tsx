"use client";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";

export default function PublicDashboard() {
  const [activeTab, setActiveTab] = useState<string>("leads");

  const features = [
    {
      id: "leads",
      title: "Lead Intelligence",
      description: "Find and enrich leads with accurate contact information and company data.",
      icon: "👥",
      screenshot: "/screenshots/leads-dashboard.png",
      benefits: [
        "Access to 50M+ verified contacts",
        "Company technographics and firmographics",
        "Email verification and validation",
        "Export to CSV or CRM"
      ]
    },
    {
      id: "ai",
      title: "AI Tools",
      description: "Generate personalized emails, call scripts, and sales content with AI.",
      icon: "🤖",
      screenshot: "/screenshots/ai-dashboard.png",
      benefits: [
        "Personalized email generation",
        "Sales call scripts and coaching",
        "Meeting summaries and follow-ups",
        "Objection handling assistance"
      ]
    },
    {
      id: "workflows",
      title: "Workflow Automation",
      description: "Automate repetitive sales tasks and create custom workflows.",
      icon: "⚙️",
      screenshot: "/screenshots/workflow-dashboard.png",
      benefits: [
        "Custom workflow creation",
        "Pre-built workflow templates",
        "Integration with CRM systems",
        "Scheduled automations"
      ]
    },
    {
      id: "analytics",
      title: "Sales Analytics",
      description: "Track performance and gain insights from your sales activities.",
      icon: "📊",
      screenshot: "/screenshots/analytics-dashboard.png",
      benefits: [
        "Credit usage tracking",
        "Performance metrics",
        "ROI calculation",
        "Activity monitoring"
      ]
    }
  ];

  const activeFeature = features.find(f => f.id === activeTab) || features[0];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">OpulFlow Dashboard</h2>
          <p className="mt-4 text-xl text-gray-600">Powerful sales tools with transparent pricing</p>
        </div>

        {/* Feature Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {features.map((feature) => (
            <Button
              key={feature.id}
              variant={activeTab === feature.id ? "default" : "outline"}
              onClick={() => setActiveTab(feature.id)}
              className="flex items-center gap-2"
            >
              <span>{feature.icon}</span>
              <span>{feature.title}</span>
            </Button>
          ))}
        </div>

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Screenshot */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative w-full h-[400px] bg-gray-100 flex items-center justify-center">
                {/* Replace with actual screenshots */}
                <div className="text-4xl">{activeFeature.icon}</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500">Screenshot: {activeFeature.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <span>{activeFeature.icon}</span>
                <span>{activeFeature.title}</span>
              </h3>
              <p className="mt-2 text-gray-600">{activeFeature.description}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Key Benefits:</h4>
              <ul className="space-y-2">
                {activeFeature.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <Link href="/register">
                <Button size="lg" className="mr-4">
                  Try For Free
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Labels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          {features.map((feature) => (
            <Card 
              key={feature.id}
              className={`cursor-pointer transition-all ${activeTab === feature.id ? 'border-blue-500 shadow-md' : ''}`}
              onClick={() => setActiveTab(feature.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{feature.icon}</div>
                  <h3 className="font-bold">{feature.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}