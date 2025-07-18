"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import useCredits from "@/hooks/useCredits";

export default function ROICalculator() {
  const { user } = useAuth();
  const { deductCredits } = useCredits();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    campaignName: "",
    leadsGenerated: 100,
    conversionRate: 10,
    averageDealSize: 5000,
    costPerLead: 25,
    salesCycleMonths: 3,
    closingCosts: 1000
  });
  const [results, setResults] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setInputs({
      ...inputs,
      [field]: field === 'campaignName' ? value : Number(value)
    });
  };

  const calculateROI = async () => {
    if (!inputs.campaignName) {
      toast.error("Please enter a campaign name");
      return;
    }

    // Check if we have credits
    const success = await deductCredits('roi_report', 1);
    if (!success) {
      toast.error("Insufficient ROI calculator credits");
      return;
    }

    setLoading(true);
    try {
      // Calculate ROI metrics
      const totalLeads = inputs.leadsGenerated;
      const conversions = Math.round(totalLeads * (inputs.conversionRate / 100));
      const totalRevenue = conversions * inputs.averageDealSize;
      const leadCost = totalLeads * inputs.costPerLead;
      const closingCost = conversions * inputs.closingCosts;
      const totalCost = leadCost + closingCost;
      const profit = totalRevenue - totalCost;
      const roi = (profit / totalCost) * 100;
      const monthlyRevenue = totalRevenue / inputs.salesCycleMonths;
      
      const calculationResults = {
        ...inputs,
        metrics: {
          totalLeads,
          conversions,
          totalRevenue,
          leadCost,
          closingCost,
          totalCost,
          profit,
          roi,
          monthlyRevenue
        },
        calculatedAt: new Date().toISOString()
      };
      
      // Save to Firestore
      await addDoc(collection(db, `users/${user?.uid}/roiCalculations`), calculationResults);
      
      setResults(calculationResults);
      toast.success("ROI calculation completed");
    } catch (error) {
      toast.error("Failed to calculate ROI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ROI Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Name</label>
              <Input
                placeholder="Enter campaign name"
                value={inputs.campaignName}
                onChange={(e) => handleInputChange('campaignName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Leads Generated</label>
              <Input
                type="number"
                placeholder="Number of leads"
                value={inputs.leadsGenerated}
                onChange={(e) => handleInputChange('leadsGenerated', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Conversion Rate (%)</label>
              <Input
                type="number"
                placeholder="Conversion percentage"
                value={inputs.conversionRate}
                onChange={(e) => handleInputChange('conversionRate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Average Deal Size ($)</label>
              <Input
                type="number"
                placeholder="Deal value"
                value={inputs.averageDealSize}
                onChange={(e) => handleInputChange('averageDealSize', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cost Per Lead ($)</label>
              <Input
                type="number"
                placeholder="Cost per lead"
                value={inputs.costPerLead}
                onChange={(e) => handleInputChange('costPerLead', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sales Cycle (months)</label>
              <Input
                type="number"
                placeholder="Sales cycle length"
                value={inputs.salesCycleMonths}
                onChange={(e) => handleInputChange('salesCycleMonths', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Closing Costs ($)</label>
              <Input
                type="number"
                placeholder="Cost to close a deal"
                value={inputs.closingCosts}
                onChange={(e) => handleInputChange('closingCosts', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={calculateROI} disabled={loading} className="w-full">
                {loading ? "Calculating..." : "Calculate ROI"}
              </Button>
            </div>
          </div>
          
          {results && (
            <div className="mt-6 border-t pt-6">
              <h3 className="font-medium text-lg mb-4">ROI Results for {results.campaignName}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm text-blue-700 mb-1">Total Revenue</h4>
                  <p className="text-2xl font-bold text-blue-800">${results.metrics.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="text-sm text-red-700 mb-1">Total Cost</h4>
                  <p className="text-2xl font-bold text-red-800">${results.metrics.totalCost.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm text-green-700 mb-1">Profit</h4>
                  <p className="text-2xl font-bold text-green-800">${results.metrics.profit.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">ROI</h4>
                  <p className="text-3xl font-bold text-indigo-600">{results.metrics.roi.toFixed(2)}%</p>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Monthly Revenue</h4>
                  <p className="text-3xl font-bold text-indigo-600">${results.metrics.monthlyRevenue.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Leads</h4>
                  <p className="text-xl font-bold">{results.metrics.totalLeads}</p>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Conversions</h4>
                  <p className="text-xl font-bold">{results.metrics.conversions}</p>
                  <p className="text-sm text-gray-500">({results.conversionRate}% rate)</p>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Cost Per Acquisition</h4>
                  <p className="text-xl font-bold">${(results.metrics.totalCost / results.metrics.conversions).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Calculation performed on {new Date(results.calculatedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}