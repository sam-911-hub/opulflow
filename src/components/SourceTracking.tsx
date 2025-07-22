"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LeadSource } from "@/types/interfaces";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import useCredits from "@/hooks/useCredits";

export default function SourceTracking() {
  const { user } = useAuth();
  const { deductCredits } = useCredits();
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSource, setNewSource] = useState({
    name: "",
    medium: "website",
    campaign: "",
  });
  const [addingSource, setAddingSource] = useState(false);

  useEffect(() => {
    if (user) fetchSources();
  }, [user]);

  const fetchSources = async () => {
    try {
      const q = query(
        collection(db, `users/${user?.uid}/leadSources`),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      setSources(querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as LeadSource)));
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching sources:", error);
      toast.error("Failed to load lead sources");
      setLoading(false);
    }
  };

  const addSource = async () => {
    if (!newSource.name) {
      toast.error("Please enter a source name");
      return;
    }

    // Check if we have credits
    const success = await deductCredits('source_tracking', 1);
    if (!success) {
      toast.error("Insufficient source tracking credits");
      return;
    }

    setAddingSource(true);
    try {
      const sourceData: Omit<LeadSource, 'id' | 'leadCount' | 'conversionRate'> = {
        name: newSource.name,
        medium: newSource.medium,
        campaign: newSource.campaign || undefined,
        createdAt: new Date().toISOString()
      };
      
      // Add to Firestore
      await addDoc(collection(db, `users/${user?.uid}/leadSources`), {
        ...sourceData,
        leadCount: 0,
        conversionRate: 0
      });
      
      toast.success("Lead source added successfully");
      setNewSource({ name: "", medium: "website", campaign: "" });
      fetchSources();
    } catch (error) {
      console.error("Error adding source:", error);
      toast.error("Failed to add lead source");
    } finally {
      setAddingSource(false);
    }
  };

  const generateTrackingLink = (source: LeadSource) => {
    const baseUrl = window.location.origin;
    const utmSource = encodeURIComponent(source.name);
    const utmMedium = encodeURIComponent(source.medium);
    const utmCampaign = source.campaign ? `&utm_campaign=${encodeURIComponent(source.campaign)}` : '';
    
    return `${baseUrl}?utm_source=${utmSource}&utm_medium=${utmMedium}${utmCampaign}`;
  };

  const copyTrackingLink = (source: LeadSource) => {
    const link = generateTrackingLink(source);
    navigator.clipboard.writeText(link);
    toast.success("Tracking link copied to clipboard");
  };

  const getTotalLeads = () => {
    return sources.reduce((sum, source) => sum + source.leadCount, 0);
  };

  const getAverageConversion = () => {
    if (sources.length === 0) return 0;
    const totalConversion = sources.reduce((sum, source) => sum + source.conversionRate, 0);
    return (totalConversion / sources.length).toFixed(1);
  };

  const getBestSource = () => {
    if (sources.length === 0) return null;
    return sources.reduce((best, current) => 
      current.conversionRate > best.conversionRate ? current : best
    );
  };

  const getSourceIcon = (medium: string) => {
    switch (medium) {
      case 'website': return '🌐';
      case 'email': return '📧';
      case 'social': return '👥';
      case 'paid': return '💰';
      case 'event': return '📅';
      case 'referral': return '👤';
      default: return '📊';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total Leads</p>
              <p className="text-3xl font-bold text-blue-600">{getTotalLeads()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Avg. Conversion</p>
              <p className="text-3xl font-bold text-green-600">{getAverageConversion()}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Best Source</p>
              <p className="text-3xl font-bold text-purple-600">
                {getBestSource()?.name || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Lead Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Source Name</label>
              <Input
                placeholder="e.g., Spring Campaign"
                value={newSource.name}
                onChange={(e) => setNewSource({...newSource, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Medium</label>
              <select
                value={newSource.medium}
                onChange={(e) => setNewSource({...newSource, medium: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="website">Website</option>
                <option value="email">Email</option>
                <option value="social">Social Media</option>
                <option value="paid">Paid Ads</option>
                <option value="event">Event</option>
                <option value="referral">Referral</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Campaign (Optional)</label>
              <Input
                placeholder="e.g., Q2 Promotion"
                value={newSource.campaign}
                onChange={(e) => setNewSource({...newSource, campaign: e.target.value})}
              />
            </div>
          </div>
          
          <Button 
            onClick={addSource} 
            disabled={addingSource || !newSource.name}
            className="mt-4"
          >
            {addingSource ? "Adding..." : "Add Source"}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Lead Sources</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading sources...</div>
          ) : sources.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No lead sources yet. Add your first source above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Medium</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Conversion</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>{source.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getSourceIcon(source.medium)}</span>
                        <span className="capitalize">{source.medium}</span>
                      </div>
                    </TableCell>
                    <TableCell>{source.campaign || '-'}</TableCell>
                    <TableCell>{source.leadCount}</TableCell>
                    <TableCell>{source.conversionRate}%</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyTrackingLink(source)}
                      >
                        Copy Tracking Link
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>How to Use Source Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">1. Create a Source</h3>
              <p className="text-sm text-gray-600">Add a new lead source using the form above.</p>
            </div>
            
            <div>
              <h3 className="font-medium">2. Copy the Tracking Link</h3>
              <p className="text-sm text-gray-600">Use the &quot;Copy Tracking Link&quot; button to get a URL with UTM parameters.</p>
            </div>
            
            <div>
              <h3 className="font-medium">3. Use in Your Marketing</h3>
              <p className="text-sm text-gray-600">Add this link to your emails, ads, social posts, or anywhere you promote your business.</p>
            </div>
            
            <div>
              <h3 className="font-medium">4. Track Performance</h3>
              <p className="text-sm text-gray-600">Monitor which sources bring in the most leads and have the highest conversion rates.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}