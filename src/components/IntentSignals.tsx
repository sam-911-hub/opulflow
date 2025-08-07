"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { IntentSignal, Lead } from "@/types/interfaces";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import useCredits from "@/hooks/useCredits";

export default function IntentSignals() {
  const { user } = useAuth();
  const { deductCredits } = useCredits();
  const [signals, setSignals] = useState<IntentSignal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSignals();
      fetchLeads();
    }
  }, [user]);

  const fetchSignals = async () => {
    try {
      const q = query(
        collection(db, `users/${user?.uid}/intentSignals`),
        orderBy("detectedAt", "desc"),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      setSignals(querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as IntentSignal)));
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching intent signals:", error);
      toast.error("Failed to load intent signals");
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, `users/${user?.uid}/leads`)
      );
      setLeads(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const scanForIntentSignals = async () => {
    // Check if we have credits
    const success = await deductCredits('intent_signals', 1);
    if (!success) {
      toast.error("Insufficient intent signals credits");
      return;
    }

    setScanning(true);
    try {
      // In a real implementation, this would call your intent detection service
      // For now, we'll simulate finding signals for existing leads
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate random signals for some leads
      const leadsWithSignals = leads
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(leads.length, 5));
      
      const signalTypes: IntentSignal['signalType'][] = [
        'website_visit',
        'content_download',
        'email_open',
        'pricing_page',
        'demo_request'
      ];
      
      const newSignals = leadsWithSignals.map(lead => {
        const signalType = signalTypes[Math.floor(Math.random() * signalTypes.length)];
        const strength = Math.floor(Math.random() * 70) + 30; // 30-100
        
        return {
          leadId: lead.id,
          leadName: lead.name,
          company: lead.company,
          signalType,
          strength,
          detectedAt: new Date().toISOString()
        };
      });
      
      // Add to Firestore
      for (const signal of newSignals) {
        await collection(db, `users/${user?.uid}/intentSignals`).add(signal);
      }
      
      toast.success(`Detected ${newSignals.length} new intent signals`);
      fetchSignals();
    } catch (error) {
      console.error("Error scanning for intent signals:", error);
      toast.error("Failed to scan for intent signals");
    } finally {
      setScanning(false);
    }
  };

  const getSignalTypeLabel = (type: IntentSignal['signalType']) => {
    switch (type) {
      case 'website_visit': return 'Website Visit';
      case 'content_download': return 'Content Download';
      case 'email_open': return 'Email Open';
      case 'pricing_page': return 'Pricing Page Visit';
      case 'demo_request': return 'Demo Request';
      default: return type;
    }
  };

  const getSignalTypeIcon = (type: IntentSignal['signalType']) => {
    switch (type) {
      case 'website_visit': return '🌐';
      case 'content_download': return '📄';
      case 'email_open': return '📧';
      case 'pricing_page': return '💰';
      case 'demo_request': return '🔍';
      default: return '📊';
    }
  };

  const getSignalStrengthColor = (strength: number) => {
    if (strength >= 80) return 'bg-green-500';
    if (strength >= 60) return 'bg-blue-500';
    if (strength >= 40) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getHighIntentLeads = () => {
    // Group signals by lead and calculate average strength
    const leadSignals: Record<string, { count: number, totalStrength: number, lead: IntentSignal }> = {};
    
    signals.forEach(signal => {
      if (!leadSignals[signal.leadId]) {
        leadSignals[signal.leadId] = {
          count: 0,
          totalStrength: 0,
          lead: signal
        };
      }
      
      leadSignals[signal.leadId].count++;
      leadSignals[signal.leadId].totalStrength += signal.strength;
    });
    
    // Calculate average strength and sort by it
    return Object.values(leadSignals)
      .map(data => ({
        ...data.lead,
        averageStrength: data.totalStrength / data.count,
        signalCount: data.count
      }))
      .sort((a, b) => b.averageStrength - a.averageStrength)
      .slice(0, 5);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Buying Intent Signals</h2>
        <Button 
          onClick={scanForIntentSignals} 
          disabled={scanning || leads.length === 0}
        >
          {scanning ? "Scanning..." : "Scan for Intent Signals"}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>High Intent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading intent data...</div>
            ) : signals.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No intent signals detected yet. Scan for signals to identify high-intent leads.
              </div>
            ) : (
              <div className="space-y-4">
                {getHighIntentLeads().map((lead) => (
                  <div key={lead.leadId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{lead.leadName}</h3>
                        <p className="text-sm text-gray-500">{lead.company}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{Math.round(lead.averageStrength)}%</div>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getSignalStrengthColor(lead.averageStrength)} rounded-full`}
                            style={{ width: `${lead.averageStrength}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {lead.signalCount} intent signals detected
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Intent Signal Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading intent data...</div>
            ) : signals.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No intent signals detected yet.
              </div>
            ) : (
              <div className="space-y-4">
                {['website_visit', 'content_download', 'email_open', 'pricing_page', 'demo_request']
                  .map((type) => {
                    const count = signals.filter(s => s.signalType === type).length;
                    const percentage = signals.length > 0 ? Math.round((count / signals.length) * 100) : 0;
                    
                    return (
                      <div key={type} className="flex items-center gap-4">
                        <div className="text-xl">{getSignalTypeIcon(type as IntentSignal['signalType'])}</div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">
                              {getSignalTypeLabel(type as IntentSignal['signalType'])}
                            </span>
                            <span className="text-sm text-gray-500">{count} signals</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Intent Signals</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading intent signals...</div>
          ) : signals.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No intent signals detected yet. Scan for signals to identify buying intent.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Signal Type</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Detected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signals.map((signal) => (
                  <TableRow key={signal.id}>
                    <TableCell>{signal.leadName}</TableCell>
                    <TableCell>{signal.company}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getSignalTypeIcon(signal.signalType)}</span>
                        <span>{getSignalTypeLabel(signal.signalType)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getSignalStrengthColor(signal.strength)} rounded-full`}
                            style={{ width: `${signal.strength}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{signal.strength}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(signal.detectedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}