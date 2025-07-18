"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(true);
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null);

  // Clear any existing timer when component unmounts
  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [redirectTimer]);

  // Handle authenticated user with delay
  useEffect(() => {
    if (!loading && user && showWelcome) {
      // Show welcome page for at least 5 seconds before redirecting
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 5000); // 5 second delay
      
      setRedirectTimer(timer);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [user, loading, router, showWelcome]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {user && (
        <div className="fixed top-0 left-0 right-0 bg-green-100 p-2 text-center z-50">
          <p className="text-green-800">
            You're already logged in! Redirecting to dashboard in a few seconds...
            <button 
              onClick={() => router.push('/dashboard')} 
              className="ml-2 underline text-blue-600 hover:text-blue-800"
            >
              Go now
            </button>
            <button 
              onClick={() => {
                setShowWelcome(false);
                if (redirectTimer) clearTimeout(redirectTimer);
              }} 
              className="ml-2 underline text-gray-600 hover:text-gray-800"
            >
              Stay on this page
            </button>
          </p>
        </div>
      )}
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to OpulFlow
          </h1>
          <p className="text-xl mb-3">
            Next-gen sales intelligence platform for modern teams
          </p>
          <p className="text-lg font-medium mb-8">
            Only pay for what you use - No subscriptions, no lock-in
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-indigo-500 text-white px-8 py-3 rounded-lg font-medium border border-indigo-400 hover:bg-indigo-600 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
          <Link
            href="/pricing"
            className="inline-block mt-6 text-white/80 hover:text-white underline"
          >
            View Pricing
          </Link>
        </div>
      </div>
      
      {/* Feature Highlights */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Clearly Labeled Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600 text-xl">👥</div>
                <h3 className="text-xl font-semibold">Sales Intelligence</h3>
              </div>
              <p className="text-gray-600 mb-4">Lead lookup, company enrichment, and email verification</p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-blue-600">From $0.25/lead</p>
                <Link href="/pricing" className="text-blue-600 text-sm hover:underline">Learn more →</Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-100 p-2 rounded-full text-purple-600 text-xl">🤖</div>
                <h3 className="text-xl font-semibold">AI-Powered Tools</h3>
              </div>
              <p className="text-gray-600 mb-4">Email generation, call scripts, and sales coaching</p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-purple-600">From $0.10/generation</p>
                <Link href="/pricing" className="text-purple-600 text-sm hover:underline">Learn more →</Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-green-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-100 p-2 rounded-full text-green-600 text-xl">⚙️</div>
                <h3 className="text-xl font-semibold">CRM & Automation</h3>
              </div>
              <p className="text-gray-600 mb-4">Mini CRM, workflow automation, and email sequences</p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-green-600">Bundles from $20</p>
                <Link href="/pricing" className="text-green-600 text-sm hover:underline">Learn more →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Public Dashboard Preview */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Powerful Dashboard</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Access all your sales intelligence tools in one intuitive interface
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-4 border">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-500">Dashboard Preview</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-blue-500 text-xl">👥</div>
                <h3 className="font-medium">Lead Management</h3>
              </div>
              <p className="text-sm text-gray-600">Track and manage your sales leads</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-purple-500 text-xl">🤖</div>
                <h3 className="font-medium">AI Generation</h3>
              </div>
              <p className="text-sm text-gray-600">Create emails and scripts with AI</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-green-500 text-xl">⚙️</div>
                <h3 className="font-medium">Workflow Automation</h3>
              </div>
              <p className="text-sm text-gray-600">Automate repetitive sales tasks</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-orange-500 text-xl">📊</div>
                <h3 className="font-medium">Analytics</h3>
              </div>
              <p className="text-sm text-gray-600">Track performance and ROI</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Simple, transparent, and flexible sales intelligence
          </p>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-blue-200 -translate-y-1/2 z-0"></div>
            
            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-2xl mb-4 border-4 border-blue-500">
                  💳
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-md w-full">
                  <h3 className="font-bold text-lg mb-2">Purchase Credits</h3>
                  <p className="text-gray-600 text-sm">Buy credits for specific services</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-2xl mb-4 border-4 border-blue-500">
                  🔍
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-md w-full">
                  <h3 className="font-bold text-lg mb-2">Use Services</h3>
                  <p className="text-gray-600 text-sm">Access tools using your credits</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-2xl mb-4 border-4 border-blue-500">
                  📊
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-md w-full">
                  <h3 className="font-bold text-lg mb-2">Track Usage</h3>
                  <p className="text-gray-600 text-sm">Monitor your credit usage</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-2xl mb-4 border-4 border-blue-500">
                  📈
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-md w-full">
                  <h3 className="font-bold text-lg mb-2">Grow Business</h3>
                  <p className="text-gray-600 text-sm">Convert insights into action</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/pricing" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              View Detailed Pricing
            </Link>
          </div>
        </div>
      </div>
        
      {/* Custom Credit Purchase */}
      <div className="py-16 bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Custom Credit Purchase</h2>
              <p className="text-xl text-gray-700 mb-2">
                Buy exactly the number of credits you need
              </p>
              <p className="text-gray-600">
                No bundles required - purchase as few or as many credits as you want
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-4">How Custom Credits Work</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Choose any credit type you need</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Select any quantity - no minimum purchase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Pay in your preferred currency</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Credits valid for 90 days</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex flex-col justify-center items-center">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">💳</div>
                    <p className="text-lg font-medium">Flexible Purchasing</p>
                  </div>
                  <Link href="/pricing#custom" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Try Custom Credits
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">OpulFlow</h3>
              <p className="text-gray-400">Next-gen sales intelligence platform with pay-as-you-go pricing</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Features</h4>
              <ul className="space-y-2">
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Sales Intelligence</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">AI Tools</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Workflow Automation</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Analytics</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white">User Manual</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link href="/help" className="text-gray-400 hover:text-white">FAQ</Link></li>
                <li><a href="mailto:opulflow.inc@gmail.com" className="text-gray-400 hover:text-white">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <p className="text-gray-400 mb-2">Email: <a href="mailto:opulflow.inc@gmail.com" className="text-blue-400 hover:text-blue-300">opulflow.inc@gmail.com</a></p>
              <p className="text-gray-400">© {new Date().getFullYear()} OpulFlow Inc. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
