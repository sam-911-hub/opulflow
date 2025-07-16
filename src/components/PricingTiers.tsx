"use client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";
import { PRICING_TIERS } from "@/types";
import UpgradeButton from "./UpgradeButton";

export default function PricingTiers() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Free Tier */}
      <Card className="relative">
        <CardHeader>
          <CardTitle className="text-2xl">Free Forever</CardTitle>
          <div className="text-3xl font-bold">$0<span className="text-sm font-normal">/month</span></div>
          <p className="text-gray-600">Perfect for solo users testing basic features</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>500 leads/month</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>50 contact enrichments/month</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>3 email templates</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>5 workflow runs/month</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>10 AI email generations/month</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>5 call scripts/month</span>
            </div>
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-red-500" />
              <span>Meeting notes</span>
            </div>
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-red-500" />
              <span>Team collaboration</span>
            </div>
          </div>
          <Button className="w-full" variant="outline">
            Current Plan
          </Button>
        </CardContent>
      </Card>

      {/* Pro Tier */}
      <Card className="relative border-blue-500 border-2">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
        <CardHeader>
          <CardTitle className="text-2xl">Pro</CardTitle>
          <div className="text-3xl font-bold">$29<span className="text-sm font-normal">/month</span></div>
          <p className="text-gray-600">For serious sales teams & scaling businesses</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="font-medium">Unlimited leads & enrichments</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="font-medium">Full company technographics</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="font-medium">Unlimited email templates</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="font-medium">Unlimited workflow runs</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="font-medium">10,000 AI credits/month</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="font-medium">Meeting notes included</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="font-medium">Team collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Priority email support</span>
            </div>
          </div>
          <UpgradeButton />
          <p className="text-xs text-gray-500 text-center">
            +$10/month per additional team member
          </p>
        </CardContent>
      </Card>
    </div>
  );
}