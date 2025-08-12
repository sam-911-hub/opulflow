"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import useResponsive from "@/hooks/useResponsive";
import ErrorBoundary from "@/components/ErrorBoundary";
import LazyTabContent from "@/components/LazyTabContent";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy components
const ApiKeyManager = lazy(() => import("@/components/ApiKeyManager"));
const SimpleCreditPurchase = lazy(() => import("@/components/SimpleCreditPurchase"));
const CustomCreditPurchase = lazy(() => import("@/components/CustomCreditPurchase"));
const TransactionHistory = lazy(() => import("@/components/TransactionHistory"));
const SimplePricing = lazy(() => import("@/components/SimplePricing"));
const TeamInvite = lazy(() => import("@/components/TeamInvite"));
const TeamMembers = lazy(() => import("@/components/TeamMembers"));
const ProFeatureGuard = lazy(() => import("@/components/ProFeatureGuard"));
const Onboarding = lazy(() => import("@/components/Onboarding"));
const MobileNavigation = lazy(() => import("@/components/MobileNavigation"));
const LogoutTab = lazy(() => import("./logout"));
const OptimizedDashboardStats = lazy(() => import("@/components/OptimizedDashboardStats"));



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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      <ErrorBoundary>
        <Suspense fallback={<div />}>
          <Onboarding />
        </Suspense>
      </ErrorBoundary>
      {/* Sidebar - hidden on mobile */}
      {!isMobile && (
        <div className="w-72 bg-white/80 backdrop-blur-xl shadow-2xl border-r border-white/20 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">OpulFlow</h1>
              <p className="text-xs text-gray-500 font-medium">Sales Intelligence Platform</p>
            </div>
          </div>
        </div>
        
        {/* User Info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">{user.email?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
              <p className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full inline-block mt-1">PAYG Account</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-white hover:shadow-md hover:scale-102'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                  {activeTab === item.id && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Buy Credits Button */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 rounded-2xl p-5 text-white text-center shadow-xl">
            <div className="text-2xl mb-2">💳</div>
            <p className="text-sm font-semibold mb-3">Need more credits?</p>
            <Button 
              onClick={() => setActiveTab('credits')} 
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0 font-semibold px-6 py-2 rounded-xl transition-all duration-200 hover:scale-105"
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
        <header className="bg-white/70 backdrop-blur-xl shadow-lg border-b border-white/20 px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                {isMobile && (
                  <div className="text-2xl p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                    {navigation.find(n => n.id === activeTab)?.icon}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {navigation.find(n => n.id === activeTab)?.name}
                  </h2>
                  {!isMobile && (
                    <p className="text-sm text-gray-600 mt-1 font-medium">
                      {activeTab === 'overview' && '🚀 Welcome to your OpulFlow dashboard'}
                      {activeTab === 'leads' && '👥 Manage and track your leads'}
                      {activeTab === 'pipeline' && '📈 Track your sales pipeline'}
                      {activeTab === 'automation' && '🤖 Automate your sales processes'}
                      {activeTab === 'analytics' && '📊 Analyze your sales performance'}
                      {activeTab === 'email' && '📧 Track email deliverability and engagement'}
                      {activeTab === 'intent' && '🎯 Identify high-intent prospects'}
                      {activeTab === 'crm' && '🔄 Sync with your CRM system'}
                      {activeTab === 'sources' && '📊 Track lead sources and attribution'}
                      {activeTab === 'calls' && '📞 Analyze sales calls with AI'}
                      {activeTab === 'extension' && '🔍 Browser extension for LinkedIn and web'}
                      {activeTab === 'credits' && '💳 Manage your account credits'}
                      {activeTab === 'team' && '👨‍💼 Collaborate with your team'}
                      {activeTab === 'settings' && '⚙️ Configure your account settings'}
                      {activeTab === 'help' && '❓ Get help and support'}
                      {activeTab === 'logout' && '🚪 Sign out of your account'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:space-x-6">
              {user?.email === 'opulflow.inc@gmail.com' && (
                <Link href="/admin" className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-200 hover:scale-105">
                  👑 ADMIN
                </Link>
              )}
              <div className="flex space-x-3">
                <div className="text-center bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 rounded-xl">
                  <p className="text-lg font-bold text-blue-600">{(user as any)?.credits?.lead_lookup ?? 0}</p>
                  <p className="text-xs text-blue-500 font-medium">Lead Credits</p>
                </div>
                <div className="text-center bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-2 rounded-xl">
                  <p className="text-lg font-bold text-purple-600">{(user as any)?.credits?.ai_email ?? 0}</p>
                  <p className="text-xs text-purple-500 font-medium">AI Credits</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-auto pb-20 md:pb-6 bg-gradient-to-br from-transparent to-white/30"> {/* Add bottom padding for mobile nav */}
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">

              
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-32 w-full rounded-xl" />}>
                  <OptimizedDashboardStats />
                </Suspense>
              </ErrorBoundary>
              
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="xl:col-span-2">
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        ⚡ Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: 'leads', icon: '👥', title: 'Manage Leads', desc: 'View and organize your leads' },
                          { id: 'pipeline', icon: '📈', title: 'View Pipeline', desc: 'Track your sales progress' },
                          { id: 'automation', icon: '🤖', title: 'Create Automation', desc: 'Set up workflows' },
                          { id: 'email', icon: '📧', title: 'Track Emails', desc: 'Monitor email performance' },
                          { id: 'intent', icon: '🎯', title: 'Intent Signals', desc: 'Find high-intent prospects' },
                          { id: 'calls', icon: '📞', title: 'Analyze Calls', desc: 'AI-powered call insights' }
                        ].map((action) => (
                          <button
                            key={action.id}
                            onClick={() => setActiveTab(action.id)}
                            className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-200 text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white group-hover:scale-110 transition-transform">
                                {action.icon}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                                <p className="text-sm text-gray-500">{action.desc}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Credit Balance */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      💳 Credit Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {[
                        { label: 'AI Email', value: (user as any)?.credits?.ai_email ?? 0, color: 'from-blue-500 to-blue-600', bg: 'from-blue-50 to-blue-100' },
                        { label: 'Lead Lookup', value: (user as any)?.credits?.lead_lookup ?? 0, color: 'from-green-500 to-green-600', bg: 'from-green-50 to-green-100' },
                        { label: 'Company Data', value: (user as any)?.credits?.company_enrichment ?? 0, color: 'from-purple-500 to-purple-600', bg: 'from-purple-50 to-purple-100' },
                        { label: 'Email Verify', value: (user as any)?.credits?.email_verification ?? 0, color: 'from-amber-500 to-amber-600', bg: 'from-amber-50 to-amber-100' }
                      ].map((credit, index) => (
                        <div key={index} className={`p-4 bg-gradient-to-r ${credit.bg} rounded-xl border border-white/50`}>
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-gray-700">{credit.label}</p>
                            <p className={`text-2xl font-bold bg-gradient-to-r ${credit.color} bg-clip-text text-transparent`}>
                              {credit.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105" 
                      onClick={() => setActiveTab('credits')}
                    >
                      💳 Buy More Credits
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">⚙️ Account Settings</h2>
                <p className="text-gray-600">Manage your profile information and API configuration</p>
              </div>
              

              
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    🔑 API Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ErrorBoundary>
                    <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                      <ApiKeyManager />
                    </Suspense>
                  </ErrorBoundary>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Credits Tab */}
          {activeTab === 'credits' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 p-8 rounded-2xl text-white shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">💳</div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">OpulFlow Credits</h2>
                    <p className="text-white/90 text-lg">Pay only for what you use with our credit-based system. No subscriptions, no lock-in.</p>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                  <p className="text-white/90 text-sm">ℹ️ Credits expire after 90 days • Minimum purchase: $10 • Instant activation</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Lead Lookup', value: (user as any)?.credits?.lead_lookup ?? 0, icon: '👥', color: 'from-blue-500 to-blue-600', bg: 'from-blue-50 to-blue-100' },
                  { label: 'Company Data', value: (user as any)?.credits?.company_enrichment ?? 0, icon: '🏢', color: 'from-green-500 to-green-600', bg: 'from-green-50 to-green-100' },
                  { label: 'Email Verify', value: (user as any)?.credits?.email_verification ?? 0, icon: '✉️', color: 'from-purple-500 to-purple-600', bg: 'from-purple-50 to-purple-100' },
                  { label: 'AI Credits', value: (user as any)?.credits?.ai_email ?? 0, icon: '🤖', color: 'from-amber-500 to-amber-600', bg: 'from-amber-50 to-amber-100' }
                ].map((credit, index) => (
                  <Card key={index} className={`bg-gradient-to-br ${credit.bg} border-0 shadow-xl overflow-hidden hover:scale-105 transition-transform duration-200`}>
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{credit.icon}</div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{credit.label}</h3>
                      <p className={`text-3xl font-bold bg-gradient-to-r ${credit.color} bg-clip-text text-transparent`}>
                        {credit.value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Tabs defaultValue="credits">
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="credits" className="flex-1">Buy Credits</TabsTrigger>
                  <TabsTrigger value="custom" className="flex-1">Custom Credits</TabsTrigger>
                  <TabsTrigger value="pricing" className="flex-1">Service Pricing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="credits">
                  <ErrorBoundary>
                    <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
                      <SimpleCreditPurchase />
                    </Suspense>
                  </ErrorBoundary>
                </TabsContent>
                
                <TabsContent value="custom">
                  <div className="max-w-md mx-auto">
                    <ErrorBoundary>
                      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
                        <CustomCreditPurchase />
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                </TabsContent>
                
                <TabsContent value="pricing">
                  <ErrorBoundary>
                    <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
                      <SimplePricing />
                    </Suspense>
                  </ErrorBoundary>
                </TabsContent>
              </Tabs>
              
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    📊 Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ErrorBoundary>
                    <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                      <TransactionHistory />
                    </Suspense>
                  </ErrorBoundary>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lazy Loaded Tab Content */}
          <ErrorBoundary>
            <LazyTabContent activeTab={activeTab} setActiveTab={setActiveTab} />
          </ErrorBoundary>

          {/* Team Tab */}
          {activeTab === 'team' && (
            <ErrorBoundary>
              <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
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
              </Suspense>
            </ErrorBoundary>
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
          {activeTab === 'logout' && (
            <ErrorBoundary>
              <Suspense fallback={<Skeleton className="h-32 w-full rounded-xl" />}>
                <LogoutTab />
              </Suspense>
            </ErrorBoundary>
          )}
        </main>
      </div>

      {/* Mobile Navigation */}
      <ErrorBoundary>
        <Suspense fallback={<div />}>
          <MobileNavigation 
            navigation={navigation}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}