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
import SimpleCreditPurchase from "@/components/SimpleCreditPurchase";
import CustomCreditPurchase from "@/components/CustomCreditPurchase";
import TransactionHistory from "@/components/TransactionHistory";
import UsageLimits from "@/components/UsageLimits";
import PricingTiers from "@/components/PricingTiers";
import WorkflowAutomation from "@/components/WorkflowAutomation";
import AIScriptGenerator from "@/components/AIScriptGenerator";
import EmailSequences from "@/components/EmailSequences";
import SimplePricing from "@/components/SimplePricing";
import PipelineManagement from "@/components/PipelineManagement";
import TechStackDetection from "@/components/TechStackDetection";
import ROICalculator from "@/components/ROICalculator";
import EmailDeliveryTracking from "@/components/EmailDeliveryTracking";
import CRMSyncSetup from "@/components/CRMSyncSetup";
import IntentSignals from "@/components/IntentSignals";
import SourceTracking from "@/components/SourceTracking";
import CallAnalysis from "@/components/CallAnalysis";
import BrowserExtension from "@/components/BrowserExtension";
import Onboarding from "@/components/Onboarding";
import MobileNavigation from "@/components/MobileNavigation";
import useResponsive from "@/hooks/useResponsive";
import LogoutTab from "./logout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import DashboardStats from "@/components/DashboardStats";
import ContactManager from "@/components/ContactManager";

export default function DashboardPage() {
  const { user, loading, accountType } = useAuth();
  const router = useRouter();
  const [forceLoaded, setForceLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { isMobile } = useResponsive();

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
    { id: 'pipeline', name: 'Pipeline', icon: '📈' },
    { id: 'automation', name: 'Automation', icon: '🤖' },
    { id: 'analytics', name: 'Analytics', icon: '📉' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'intent', name: 'Intent', icon: '🎯' },
    { id: 'crm', name: 'CRM', icon: '🔄' },
    { id: 'sources', name: 'Sources', icon: '📊' },
    { id: 'calls', name: 'Calls', icon: '📞' },
    { id: 'extension', name: 'Extension', icon: '🔍' },

    { id: 'credits', name: 'Credits', icon: '💳' },
    { id: 'team', name: 'Team', icon: '👨‍💼' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'help', name: 'Help & Support', icon: '❓' },
    { id: 'logout', name: 'Logout', icon: '🚪' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Onboarding />
      {/* Sidebar - hidden on mobile */}
      {!isMobile && (
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
        <nav className="flex-1 p-4 overflow-y-auto">
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
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                {isMobile && (
                  <span className="text-xl">{navigation.find(n => n.id === activeTab)?.icon}</span>
                )}
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                  {navigation.find(n => n.id === activeTab)?.name}
                </h2>
              </div>
              {!isMobile && (
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === 'overview' && 'Welcome to your OpulFlow dashboard'}
                  {activeTab === 'leads' && 'Manage and track your leads'}
                  {activeTab === 'pipeline' && 'Track your sales pipeline'}
                  {activeTab === 'automation' && 'Automate your sales processes'}
                  {activeTab === 'analytics' && 'Analyze your sales performance'}
                  {activeTab === 'email' && 'Track email deliverability and engagement'}
                  {activeTab === 'intent' && 'Identify high-intent prospects'}
                  {activeTab === 'crm' && 'Sync with your CRM system'}
                  {activeTab === 'sources' && 'Track lead sources and attribution'}
                  {activeTab === 'calls' && 'Analyze sales calls with AI'}
                  {activeTab === 'extension' && 'Browser extension for LinkedIn and web'}
                  {activeTab === 'credits' && 'Manage your account credits'}
                  {activeTab === 'team' && 'Collaborate with your team'}
                  {activeTab === 'settings' && 'Configure your account settings'}
                  {activeTab === 'help' && 'Get help and support'}
                  {activeTab === 'logout' && 'Sign out of your account'}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
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
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6"> {/* Add bottom padding for mobile nav */}
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <DashboardStats />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('leads')}>
                        👥 Manage Leads
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('pipeline')}>
                        📈 View Pipeline
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('automation')}>
                        🤖 Create Automation
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('email')}>
                        📧 Track Emails
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('intent')}>
                        🎯 Check Intent Signals
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('calls')}>
                        📞 Analyze Calls
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('extension')}>
                        🔍 Browser Extension
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Credit Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">AI Email Credits</p>
                        <p className="text-2xl font-bold text-blue-600">{(user as any)?.credits?.ai_email || 0}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">Lead Lookup Credits</p>
                        <p className="text-2xl font-bold text-green-600">{(user as any)?.credits?.lead_lookup || 0}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-700">Company Data</p>
                        <p className="text-2xl font-bold text-purple-600">{(user as any)?.credits?.company_enrichment || 0}</p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg">
                        <p className="text-sm text-amber-700">Email Verification</p>
                        <p className="text-2xl font-bold text-amber-600">{(user as any)?.credits?.email_verification || 0}</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      variant="outline" 
                      onClick={() => setActiveTab('credits')}
                    >
                      Buy More Credits
                    </Button>
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
                  <TabsTrigger value="custom" className="flex-1">Custom Credits</TabsTrigger>
                  <TabsTrigger value="pricing" className="flex-1">Service Pricing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="credits">
                  <SimpleCreditPurchase />
                </TabsContent>
                
                <TabsContent value="custom">
                  <div className="max-w-md mx-auto">
                    <CustomCreditPurchase />
                  </div>
                </TabsContent>
                
                <TabsContent value="pricing">
                  <SimplePricing />
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
              <ContactManager />
            </div>
          )}

          {/* Pipeline Tab */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pipeline Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <PipelineManagement />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <Tabs defaultValue="tech">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="tech">Tech Stack Detection</TabsTrigger>
                  <TabsTrigger value="roi">ROI Calculator</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tech">
                  <TechStackDetection />
                </TabsContent>
                <TabsContent value="roi">
                  <ROICalculator />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Delivery Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmailDeliveryTracking />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Intent Tab */}
          {activeTab === 'intent' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Intent Signals</CardTitle>
                </CardHeader>
                <CardContent>
                  <IntentSignals />
                </CardContent>
              </Card>
            </div>
          )}

          {/* CRM Tab */}
          {activeTab === 'crm' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>CRM Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CRMSyncSetup />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sources Tab */}
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Source Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <SourceTracking />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Calls Tab */}
          {activeTab === 'calls' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Call Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CallAnalysis />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Extension Tab */}
          {activeTab === 'extension' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Browser Extension</CardTitle>
                </CardHeader>
                <CardContent>
                  <BrowserExtension />
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
          
          {/* Help & Support Tab */}
          {activeTab === 'help' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Help & Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Need assistance?</h3>
                    <p className="text-blue-700 mb-4">Our support team is here to help you get the most out of OpulFlow.</p>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold">Email Support</h3>
                        <a href="mailto:opulflow.inc@gmail.com" className="text-blue-600">opulflow.inc@gmail.com</a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Link href="/help" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-semibold mb-1">User Manual</h3>
                      <p className="text-sm text-gray-600">Comprehensive guide to all OpulFlow features</p>
                    </Link>
                    
                    <Link href="/help#pricing" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-semibold mb-1">Pricing Guide</h3>
                      <p className="text-sm text-gray-600">Detailed information about our PAYG pricing</p>
                    </Link>
                    
                    <Link href="/help/faq" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-semibold mb-1">FAQ</h3>
                      <p className="text-sm text-gray-600">Answers to commonly asked questions</p>
                    </Link>
                    
                    <Link href="/help#contact" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <h3 className="font-semibold mb-1">Contact Us</h3>
                      <p className="text-sm text-gray-600">Get in touch with our support team</p>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Logout Tab */}
          {activeTab === 'logout' && <LogoutTab />}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation 
        navigation={navigation}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}