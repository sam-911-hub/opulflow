"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useResponsive from "@/hooks/useResponsive";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { BarChart3, Settings, HelpCircle, LogOut, Rocket, Construction, Lightbulb, Mail, Crown } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      toast.error("Please login first");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <div className="text-center">
          <div className="w-16 h-16 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600 border-r-amber-600 mx-auto mb-6" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Welcome to OpulFlow
            </h2>
            <p className="text-orange-700 animate-pulse">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const navigation = [
    { id: 'overview', name: 'Overview', icon: <BarChart3 className="h-5 w-5" /> },
    { id: 'settings', name: 'Settings', icon: <Settings className="h-5 w-5" /> },
    { id: 'help', name: 'Help & Support', icon: <HelpCircle className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex">
      {/* Sidebar - hidden on mobile */}
      {!isMobile && (
        <div className="w-72 glass-effect flex flex-col">
          {/* Logo/Header */}
          <div className="p-6 border-b border-orange-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">OpulFlow</h1>
                <p className="text-xs text-orange-600 font-medium">Coming Soon</p>
              </div>
            </div>
          </div>
          
          {/* User Info */}
          <div className="p-4 border-b border-orange-200">
            <div className="flex items-center space-x-3 bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-xl">
              <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">{user.email?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-orange-900 truncate">{user.email}</p>
                <p className="text-xs text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded-full inline-block mt-1">User</p>
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
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                      activeTab === item.id
                        ? 'gradient-primary text-white shadow-xl transform scale-105'
                        : 'text-orange-700 hover:bg-white hover:shadow-lg hover:scale-102'
                    }`}
                  >
                    <div className={activeTab === item.id ? 'text-white' : 'text-orange-600'}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.name}</span>
                    {activeTab === item.id && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Logout Button */}
          <div className="p-4 border-t border-orange-200">
            <Button 
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="glass-effect px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                {isMobile && (
                  <div className="p-2 gradient-primary rounded-xl text-white">
                    {navigation.find(n => n.id === activeTab)?.icon}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-900 to-amber-800 bg-clip-text text-transparent">
                    {navigation.find(n => n.id === activeTab)?.name}
                  </h2>
                  {!isMobile && (
                    <p className="text-sm text-orange-700 mt-1 font-medium">
                      {activeTab === 'overview' && 'Welcome to OpulFlow - New features coming soon!'}
                      {activeTab === 'settings' && 'Configure your account settings'}
                      {activeTab === 'help' && 'Get help and support'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:space-x-6">
              {user?.email === 'opulflow.inc@gmail.com' && (
                <Link href="/admin" className="gradient-secondary text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  ADMIN
                </Link>
              )}
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-auto pb-20 md:pb-6 bg-gradient-to-br from-transparent to-white/30">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <Card className="modern-card glass-effect">
                <CardHeader className="gradient-primary text-white">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <Rocket className="h-6 w-6" />
                    Welcome to OpulFlow
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <Construction className="h-16 w-16 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-orange-900 mb-4">New Features Coming Soon!</h3>
                  <p className="text-orange-700 text-lg mb-6">
                    We're working hard to bring you amazing new features. Stay tuned for updates!
                  </p>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <div className="flex items-center justify-center gap-2 text-orange-800 text-sm">
                      <Lightbulb className="h-4 w-4" />
                      In the meantime, you can explore the settings and help sections.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <Card className="modern-card glass-effect">
                <CardHeader className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <Settings className="h-6 w-6" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                      <h3 className="font-semibold text-orange-900 mb-2">Account Information</h3>
                      <p className="text-orange-700">Email: {user.email}</p>
                      <p className="text-orange-700">Account Type: Free</p>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-2 text-amber-800 text-sm">
                        <Construction className="h-4 w-4" />
                        More settings options will be available soon!
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Help & Support Tab */}
          {activeTab === 'help' && (
            <div className="space-y-6">
              <Card className="modern-card glass-effect">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <HelpCircle className="h-6 w-6" />
                    Help & Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">Need assistance?</h3>
                    <p className="text-blue-700 mb-4">Our support team is here to help you.</p>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Email Support</h3>
                        <a href="mailto:opulflow.inc@gmail.com" className="text-blue-600 hover:underline">opulflow.inc@gmail.com</a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 glass-effect p-4">
          <div className="flex justify-around max-w-md mx-auto">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.id
                    ? 'gradient-primary text-white shadow-lg scale-105'
                    : 'text-orange-600 hover:bg-orange-50 hover:scale-105'
                }`}
              >
                <div className="mb-1">{item.icon}</div>
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center p-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 hover:scale-105"
            >
              <LogOut className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}