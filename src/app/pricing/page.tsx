"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PricingCalculator from "@/components/PricingCalculator";
import CustomCreditPurchase from "@/components/CustomCreditPurchase";
import HowItWorks from "@/components/HowItWorks";
import FeatureComparison from "@/components/FeatureComparison";
import SimplePricing from "@/components/SimplePricing";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Transparent Pay-As-You-Go Pricing</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Only pay for what you use. No subscriptions, no lock-in.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#calculator">
              <Button size="lg" variant="secondary">
                Calculate Your Cost
              </Button>
            </Link>
            <Link href="#custom">
              <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20">
                Custom Credit Purchase
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="pricing" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="pricing">Service Pricing</TabsTrigger>
            <TabsTrigger value="calculator" id="calculator">Pricing Calculator</TabsTrigger>
            <TabsTrigger value="custom" id="custom">Custom Credits</TabsTrigger>
            <TabsTrigger value="compare">Comparison</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pricing">
            <SimplePricing />
          </TabsContent>
          
          <TabsContent value="calculator">
            <PricingCalculator />
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="max-w-md mx-auto">
              <CustomCreditPurchase />
            </div>
          </TabsContent>
          
          <TabsContent value="compare">
            <FeatureComparison />
          </TabsContent>
        </Tabs>
      </div>

      {/* How It Works Section */}
      <HowItWorks />

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Create your free account and start using OpulFlow's powerful sales intelligence tools today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg">
                Create Free Account
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}