"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CRMIntegration } from "@/types/interfaces";
import useCredits from "@/hooks/useCredits";

export default function CRMSyncSetup() {
  const { user } = useAuth();
  const { deductCredits } = useCredits();
  const [integrations, setIntegrations] = useState<CRMIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [newIntegration, setNewIntegration] = useState({
    provider: "salesforce" as const,
    apiKey: "",
  });

  useEffect(() => {
    if (user) fetchIntegrations();
  }, [user]);

  const fetchIntegrations = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, `users/${user?.uid}/crmIntegrations`)
      );
      
      setIntegrations(querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as CRMIntegration)));
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching CRM integrations:", error);
      toast.error("Failed to load CRM integrations");
      setLoading(false);
    }
  };

  const addIntegration = async () => {
    if (!newIntegration.apiKey) {
      toast.error("Please enter an API key");
      return;
    }

    // Check if we have credits
    const success = await deductCredits('crm_sync', 1);
    if (!success) {
      toast.error("Insufficient CRM sync credits");
      return;
    }

    try {
      const integrationData: Omit<CRMIntegration, 'id'> = {
        provider: newIntegration.provider,
        apiKey: newIntegration.apiKey,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      
      // Add to Firestore
      await addDoc(collection(db, `users/${user?.uid}/crmIntegrations`), integrationData);
      
      toast.success(`${newIntegration.provider} integration added successfully`);
      setNewIntegration({ provider: "salesforce", apiKey: "" });
      fetchIntegrations();
    } catch (error) {
      console.error("Error adding integration:", error);
      toast.error("Failed to add integration");
    }
  };

  const syncIntegration = async (integration: CRMIntegration) => {
    setSyncing(integration.id);
    try {
      // In a real implementation, this would call your CRM API
      // For now, we'll simulate syncing
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update integration status
      const integrationRef = doc(db, `users/${user?.uid}/crmIntegrations`, integration.id);
      await updateDoc(integrationRef, {
        lastSynced: new Date().toISOString(),
        status: 'active'
      });
      
      toast.success(`${integration.provider} synced successfully`);
      fetchIntegrations();
    } catch (error) {
      console.error("Error syncing:", error);
      toast.error("Failed to sync");
    } finally {
      setSyncing(null);
    }
  };

  const deleteIntegration = async (id: string) => {
    try {
      await deleteDoc(doc(db, `users/${user?.uid}/crmIntegrations`, id));
      toast.success("Integration removed");
      fetchIntegrations();
    } catch (error) {
      console.error("Error deleting integration:", error);
      toast.error("Failed to remove integration");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add CRM Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">CRM Provider</label>
              <select
                value={newIntegration.provider}
                onChange={(e) => setNewIntegration({
                  ...newIntegration, 
                  provider: e.target.value as CRMIntegration['provider']
                })}
                className="w-full p-2 border rounded-md"
              >
                <option value="salesforce">Salesforce</option>
                <option value="hubspot">HubSpot</option>
                <option value="pipedrive">Pipedrive</option>
                <option value="zoho">Zoho CRM</option>
                <option value="custom">Custom CRM</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">API Key / Token</label>
              <Input
                type="password"
                placeholder="Enter API key or token"
                value={newIntegration.apiKey}
                onChange={(e) => setNewIntegration({...newIntegration, apiKey: e.target.value})}
              />
            </div>
            
            <Button 
              onClick={addIntegration} 
              disabled={!newIntegration.apiKey}
              className="w-full"
            >
              Add Integration
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>CRM Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading integrations...</div>
          ) : integrations.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No CRM integrations yet. Add your first integration above.
            </div>
          ) : (
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium capitalize">{integration.provider}</h3>
                      <p className="text-sm text-gray-500">
                        {integration.lastSynced 
                          ? `Last synced: ${new Date(integration.lastSynced).toLocaleString()}` 
                          : 'Never synced'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        integration.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : integration.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {integration.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <div>
                      <p className="text-xs text-gray-500">API Key: ••••••••{integration.apiKey?.slice(-4)}</p>
                      <p className="text-xs text-gray-500">Added: {new Date(integration.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => syncIntegration(integration)}
                        disabled={syncing === integration.id}
                      >
                        {syncing === integration.id ? "Syncing..." : "Sync Now"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteIntegration(integration.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                  {integration.status === 'error' && integration.errorMessage && (
                    <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
                      Error: {integration.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Sync Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-sync frequency</h3>
                <p className="text-sm text-gray-500">How often to sync data with your CRM</p>
              </div>
              <select className="border rounded p-2">
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="manual">Manual only</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Sync direction</h3>
                <p className="text-sm text-gray-500">How data should flow between systems</p>
              </div>
              <select className="border rounded p-2">
                <option value="bidirectional">Bidirectional</option>
                <option value="to_crm">OpulFlow → CRM</option>
                <option value="from_crm">CRM → OpulFlow</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Data to sync</h3>
                <p className="text-sm text-gray-500">What data should be synchronized</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="sync_leads" defaultChecked />
                  <label htmlFor="sync_leads" className="text-sm">Leads</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="sync_deals" defaultChecked />
                  <label htmlFor="sync_deals" className="text-sm">Deals</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="sync_activities" defaultChecked />
                  <label htmlFor="sync_activities" className="text-sm">Activities</label>
                </div>
              </div>
            </div>
            
            <Button className="w-full">Save Sync Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}