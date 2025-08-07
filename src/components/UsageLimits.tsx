"use client";
import { useAuth } from "@/context/AuthContext";
import { PRICING_TIERS } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

export default function UsageLimits() {
  const { user, accountType } = useAuth();
  
  const limits = PRICING_TIERS[accountType as keyof typeof PRICING_TIERS]?.limits;
  const usage = (user as any)?.usage || {};

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const formatLimit = (limit: number) => {
    return limit === -1 ? "Unlimited" : limit.toLocaleString();
  };

  if (!limits) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Leads */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Leads</span>
            <span>{usage.leads || 0} / {formatLimit(limits.leads)}</span>
          </div>
          <Progress value={getUsagePercentage(usage.leads || 0, limits.leads)} />
        </div>

        {/* Contact Enrichment */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Contact Enrichment</span>
            <span>{usage.enrichment || 0} / {formatLimit(limits.enrichment)}</span>
          </div>
          <Progress value={getUsagePercentage(usage.enrichment || 0, limits.enrichment)} />
        </div>

        {/* Workflow Runs */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Workflow Runs</span>
            <span>{usage.workflowRuns || 0} / {formatLimit(limits.workflowRuns)}</span>
          </div>
          <Progress value={getUsagePercentage(usage.workflowRuns || 0, limits.workflowRuns)} />
        </div>

        {/* Email Writer */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>AI Email Writer</span>
            <span>{usage.emailWriter || 0} / {formatLimit(limits.emailWriter)}</span>
          </div>
          <Progress value={getUsagePercentage(usage.emailWriter || 0, limits.emailWriter)} />
        </div>

        {/* Call Scripts */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Call Scripts</span>
            <span>{usage.callScripts || 0} / {formatLimit(limits.callScripts)}</span>
          </div>
          <Progress value={getUsagePercentage(usage.callScripts || 0, limits.callScripts)} />
        </div>

        {accountType === 'free' && (
          <div className="text-xs text-gray-500 mt-4">
            Usage resets monthly. Upgrade to Pro for unlimited access.
          </div>
        )}
      </CardContent>
    </Card>
  );
}