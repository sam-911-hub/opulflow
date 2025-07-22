"use client";
import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, addDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import useCredits from "@/hooks/useCredits";

export default function BrowserExtension() {
  const { user } = useAuth();
  const { deductCredits } = useCredits();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db, `users/${user?.uid}/subscriptions`),
        where("type", "==", "extension_access"),
        where("active", "==", true),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setSubscription({
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load extension subscription");
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const activateExtension = async () => {
    // Check if we have credits
    const success = await deductCredits('extension_access', 1);
    if (!success) {
      toast.error("Insufficient extension access credits");
      return;
    }

    setActivating(true);
    try {
      // Create a subscription record
      const subscriptionData = {
        type: "extension_access",
        active: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        features: {
          contactLookup: true,
          companyEnrichment: true,
          emailVerification: true
        }
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, `users/${user?.uid}/subscriptions`), subscriptionData);
      
      setSubscription({
        id: docRef.id,
        ...subscriptionData
      });
      
      toast.success("Browser extension activated successfully");
    } catch (error) {
      console.error("Error activating extension:", error);
      toast.error("Failed to activate extension");
    } finally {
      setActivating(false);
    }
  };

  const downloadExtension = () => {
    toast.info("Extension download will be available soon");
    // In a real implementation, this would redirect to the Chrome Web Store or provide a direct download link
  };

  const getDaysRemaining = () => {
    if (!subscription?.expiresAt) return 0;
    
    const expiresAt = new Date(subscription.expiresAt);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">OpulFlow Browser Extension</h3>
        <p className="text-blue-700">Access OpulFlow's powerful tools directly in your browser while browsing LinkedIn, company websites, and more.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Extension Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading subscription status...</div>
            ) : subscription ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <h3 className="font-medium text-green-800">Extension Active</h3>
                  <p className="text-sm text-green-700 mt-1">
                    {getDaysRemaining()} days remaining
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Subscription Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Activated:</span>
                      <span>{new Date(subscription.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expires:</span>
                      <span>{new Date(subscription.expiresAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact Lookup:</span>
                      <span>{subscription.features?.contactLookup ? '✅' : '❌'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Company Enrichment:</span>
                      <span>{subscription.features?.companyEnrichment ? '✅' : '❌'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email Verification:</span>
                      <span>{subscription.features?.emailVerification ? '✅' : '❌'}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={downloadExtension}
                  className="w-full"
                >
                  Download Extension
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">⚠️</div>
                  <h3 className="font-medium text-yellow-800">Extension Not Active</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Activate the extension to access OpulFlow directly in your browser
                  </p>
                </div>
                
                <Button 
                  onClick={activateExtension} 
                  disabled={activating}
                  className="w-full"
                >
                  {activating ? "Activating..." : "Activate Extension (1 Credit)"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Extension Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-xl">👤</div>
                  <h3 className="font-medium">Contact Lookup</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Instantly see contact details for people you're viewing on LinkedIn, Twitter, and company websites.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-xl">🏢</div>
                  <h3 className="font-medium">Company Enrichment</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Get detailed company information, tech stack, and firmographics while browsing company websites.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-xl">✉️</div>
                  <h3 className="font-medium">Email Verification</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Verify email addresses directly in your Gmail or Outlook compose window.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-xl">💾</div>
                  <h3 className="font-medium">One-Click Save</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Save contacts and companies to your OpulFlow account with a single click.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Browser Compatibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🌐</div>
              <h3 className="font-medium">Chrome</h3>
              <p className="text-xs text-green-600">Fully Compatible</p>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🦊</div>
              <h3 className="font-medium">Firefox</h3>
              <p className="text-xs text-green-600">Fully Compatible</p>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🧭</div>
              <h3 className="font-medium">Edge</h3>
              <p className="text-xs text-green-600">Fully Compatible</p>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🧪</div>
              <h3 className="font-medium">Safari</h3>
              <p className="text-xs text-yellow-600">Coming Soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}