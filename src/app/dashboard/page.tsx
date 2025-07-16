"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ApiKeyManager from "@/components/ApiKeyManager";
import LeadsTable from "@/components/LeadsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UpgradeButton from "@/components/UpgradeButton";
import TeamInvite from "@/components/TeamInvite";
import TeamMembers from "@/components/TeamMembers";
import ProFeatureGuard from "@/components/ProFeatureGuard";
import CreditPurchase from "@/components/CreditPurchase";
import TransactionHistory from "@/components/TransactionHistory";
import UsageLimits from "@/components/UsageLimits";
import PricingTiers from "@/components/PricingTiers";
import WorkflowAutomation from "@/components/WorkflowAutomation";
import AIScriptGenerator from "@/components/AIScriptGenerator";
import EmailSequences from "@/components/EmailSequences";
import ServicePricing from "@/components/ServicePricing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const { user, loading, accountType } = useAuth();
  const router = useRouter();
  const [forceLoaded, setForceLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout, forcing loaded state');
        setForceLoaded(true);
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      toast.error("Please login first");
    }
  }, [user, loading, router]);

  if (loading && !forceLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) return null;

  const navigation = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'leads', name: 'Leads', icon: '👥' },
    { id: 'automation', name: 'Automation', icon: '🤖' },
    { id: 'credits', name: 'Credits', icon: '💳' },
    { id: 'team', name: 'Team', icon: '👨‍💼' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">OpulFlow</h1>
          <p className="text-sm text-gray-500 mt-1">Sales Intelligence Platform</p>
        </div>
        
        {/* User Info */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{user.email?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
              <p className="text-xs text-gray-500">PAYG Account</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Buy Credits Button */}
        <div className="p-4 border-t">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white text-center">
            <p className="text-sm font-medium mb-2">Running low on credits?</p>
            <Button 
              onClick={() => setActiveTab('credits')} 
              className="bg-white text-blue-700 hover:bg-blue-50"
            >
              Buy Credits
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {navigation.find(n => n.id === activeTab)?.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === 'overview' && 'Welcome to your OpulFlow dashboard'}
                {activeTab === 'leads' && 'Manage and track your leads'}
                {activeTab === 'automation' && 'Automate your sales processes'}
                {activeTab === 'credits' && 'Manage your account credits'}
                {activeTab === 'team' && 'Collaborate with your team'}
                {activeTab === 'settings' && 'Configure your account settings'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{(user as any)?.credits?.lead_lookup || 0}</p>
                <p className="text-xs text-gray-500">Lead Credits</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{(user as any)?.credits?.ai_email || 0}</p>
                <p className="text-xs text-gray-500">AI Credits</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">AI Email Credits</p>
                        <p className="text-2xl font-bold text-blue-600">{(user as any)?.credits?.ai_email || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-xl">🤖</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Lead Lookup Credits</p>
                        <p className="text-2xl font-bold text-green-600">{(user as any)?.credits?.lead_lookup || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 text-xl">👥</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Company Data</p>
                        <p className="text-2xl font-bold text-purple-600">{(user as any)?.credits?.company_enrichment || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 text-xl">🏢</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-sm text-gray-600">Account created</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <p className="text-sm text-gray-600">API keys configured</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('leads')}>
                        👥 Manage Leads
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('automation')}>
                        🤖 Create Automation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <ApiKeyManager />
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Credits Tab */}
          {activeTab === 'credits' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <p className="text-blue-800 font-medium mb-2">💡 OpulFlow Sales Intelligence Platform</p>
                <p className="text-blue-700 text-sm">Pay only for what you use with our credit-based system. No subscriptions, no lock-in.</p>
                <p className="text-blue-600 text-xs mt-2">Credits expire after 90 days. Minimum purchase: $10</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Current Credits</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-blue-700">Lead Lookup</p>
                        <p className="text-xl font-bold">{(user as any)?.credits?.lead_lookup || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">Company Data</p>
                        <p className="text-xl font-bold">{(user as any)?.credits?.company_enrichment || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">Email Verify</p>
                        <p className="text-xl font-bold">{(user as any)?.credits?.email_verification || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">AI Credits</p>
                        <p className="text-xl font-bold">{(user as any)?.credits?.ai_email || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 col-span-2">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-purple-800 mb-2">Active Bundles</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border rounded p-2 bg-white">
                        <p className="text-sm font-medium text-purple-700">CRM Light</p>
                        <p className="text-xs text-gray-500">Expires in 30 days</p>
                      </div>
                      <div className="border rounded p-2 bg-white">
                        <p className="text-sm font-medium text-purple-700">Email Bundle</p>
                        <p className="text-xs text-gray-500">Expires in 60 days</p>
                      </div>
                      <div className="border rounded p-2 bg-white border-dashed flex items-center justify-center">
                        <p className="text-sm text-gray-400">+ Add Bundle</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Tabs defaultValue="credits">
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="credits" className="flex-1">Buy Credits</TabsTrigger>
                  <TabsTrigger value="pricing" className="flex-1">Service Pricing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="credits">
                  <CreditPurchase />
                </TabsContent>
                
                <TabsContent value="pricing">
                  <ServicePricing />
                </TabsContent>
              </Tabs>
              
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <TransactionHistory />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Automation Tab */}
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium mb-2">🎉 Automation Tools</p>
                <p className="text-green-700 text-sm">Create workflows, generate AI scripts, and set up email sequences with our pay-as-you-go credits.</p>
                <p className="text-green-600 text-xs mt-2">Workflow runs from $0.05 each | AI generation from $0.10 each</p>
              </div>
              
              <Tabs defaultValue="workflows">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="workflows">Workflows</TabsTrigger>
                  <TabsTrigger value="ai">AI Tools</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>
                
                <TabsContent value="workflows">
                  <WorkflowAutomation />
                </TabsContent>
                <TabsContent value="ai">
                  <AIScriptGenerator />
                </TabsContent>
                <TabsContent value="email">
                  <EmailSequences />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <LeadsTable />
                </CardContent>
              </Card>
            </div>
          )}



          {/* Team Tab */}
          {activeTab === 'team' && (
            <ProFeatureGuard>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <TeamInvite />
                    <TeamMembers />
                  </CardContent>
                </Card>
              </div>
            </ProFeatureGuard>
          )}
        </main>
      </div>
    </div>
  );
}