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
              <p className="text-xs text-gray-500">{accountType === "pro" ? "Pro" : "Free"} Plan</p>
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
        
        {/* Upgrade Button */}
        {accountType === "free" && (
          <div className="p-4 border-t">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white text-center">
              <p className="text-sm font-medium mb-2">Unlock Pro Features</p>
              <UpgradeButton />
            </div>
          </div>
        )}
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
                <p className="text-sm font-medium text-gray-900">{(user as any)?.usage?.leads || 0}</p>
                <p className="text-xs text-gray-500">Leads Used</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{(user as any)?.credits?.ai || 0}</p>
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
                        <p className="text-sm font-medium text-gray-600">AI Credits</p>
                        <p className="text-2xl font-bold text-blue-600">{(user as any)?.credits?.ai || 0}</p>
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
                        <p className="text-sm font-medium text-gray-600">Lead Credits</p>
                        <p className="text-2xl font-bold text-green-600">{(user as any)?.credits?.leads || 0}</p>
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
                        <p className="text-sm font-medium text-gray-600">Export Credits</p>
                        <p className="text-2xl font-bold text-purple-600">{(user as any)?.credits?.exports || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 text-xl">📊</span>
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium mb-2">💡 OpulFlow Sales Intelligence Platform</p>
                <p className="text-blue-700 text-sm">Free tier includes 500 leads/month. Upgrade to Pro for unlimited access or buy PAYG credits.</p>
              </div>
              
              <UsageLimits />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Pricing Plans</h3>
                  <PricingTiers />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Pay-As-You-Go Credits</h3>
                  <CreditPurchase />
                </div>
              </div>
              
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium mb-2">🎉 All automation tools are free!</p>
                <p className="text-green-700 text-sm">Create workflows, generate AI scripts, and set up email sequences.</p>
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