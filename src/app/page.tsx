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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 to-orange-800">
      {user && (
        <div className="fixed top-0 left-0 right-0 bg-green-100 p-2 text-center z-50">
          <p className="text-green-800">
            You're already logged in! Redirecting to dashboard in a few seconds...
            <button 
              onClick={() => router.push('/dashboard')} 
              className="ml-2 underline text-orange-600 hover:text-orange-800"
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
      <div className="bg-gradient-to-br from-orange-700 to-orange-800 text-white py-20">
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
              className="bg-white text-orange-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-orange-600 text-white px-8 py-3 rounded-lg font-medium border border-orange-500 hover:bg-orange-700 transition-colors"
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
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-orange-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Sales Intelligence</h3>
              </div>
              <p className="text-gray-800 mb-4">Lead lookup, company enrichment, and email verification</p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-orange-600">From $0.25/lead</p>
                <Link href="/pricing" className="text-orange-600 text-sm hover:underline">Learn more →</Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-orange-600">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 p-2 rounded-full text-orange-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">AI-Powered Tools</h3>
              </div>
              <p className="text-gray-800 mb-4">Email generation, call scripts, and sales coaching</p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-orange-700">From $0.10/generation</p>
                <Link href="/pricing" className="text-orange-700 text-sm hover:underline">Learn more →</Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-orange-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 p-2 rounded-full text-orange-800">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">CRM & Automation</h3>
              </div>
              <p className="text-gray-800 mb-4">Mini CRM, workflow automation, and email sequences</p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-orange-800">Bundles from $20</p>
                <Link href="/pricing" className="text-orange-800 text-sm hover:underline">Learn more →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      

      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">How It Works</h2>
          <p className="text-center text-gray-800 mb-12 max-w-3xl mx-auto">
            Simple, transparent, and flexible sales intelligence
          </p>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-orange-200 -translate-y-1/2 z-0"></div>
            
            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-4 border-4 border-orange-500">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-md w-full">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Purchase Credits</h3>
                  <p className="text-gray-800 text-sm">Buy credits for specific services</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-4 border-4 border-orange-500">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-md w-full">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Use Services</h3>
                  <p className="text-gray-800 text-sm">Access tools using your credits</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-4 border-4 border-orange-500">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-md w-full">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Track Usage</h3>
                  <p className="text-gray-800 text-sm">Monitor your credit usage</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-4 border-4 border-orange-500">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-md w-full">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Grow Business</h3>
                  <p className="text-gray-800 text-sm">Convert insights into action</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/pricing" className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors">
              View Detailed Pricing
            </Link>
          </div>
        </div>
      </div>
        
      {/* Custom Credit Purchase */}
      <div className="py-16 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Custom Credit Purchase</h2>
              <p className="text-xl text-gray-800 mb-2">
                Buy exactly the number of credits you need
              </p>
              <p className="text-gray-700">
                No bundles required - purchase as few or as many credits as you want
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-4 text-gray-900">How Custom Credits Work</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-800">Choose any credit type you need</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-800">Select any quantity - no minimum purchase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-800">Pay in your preferred currency</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-800">Credits valid for 90 days</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex flex-col justify-center items-center">
                  <div className="text-center mb-4">
                    <div className="flex justify-center mb-2">
                      <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900">Flexible Purchasing</p>
                  </div>
                  <Link href="/pricing#custom" className="bg-orange-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-orange-700 transition-all duration-300 hover:scale-105 shadow-lg">
                    Try Custom Credits
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gradient-to-br from-orange-900 to-amber-900 text-white pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-orange-100">OpulFlow</h3>
              <p className="text-orange-200">Next-gen sales intelligence platform with pay-as-you-go pricing</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-orange-100">Features</h4>
              <ul className="space-y-2">
                <li><Link href="/pricing" className="text-orange-200 hover:text-white transition-colors">Sales Intelligence</Link></li>
                <li><Link href="/pricing" className="text-orange-200 hover:text-white transition-colors">AI Tools</Link></li>
                <li><Link href="/pricing" className="text-orange-200 hover:text-white transition-colors">Workflow Automation</Link></li>
                <li><Link href="/pricing" className="text-orange-200 hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-orange-100">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-orange-200 hover:text-white transition-colors">User Manual</Link></li>
                <li><Link href="/pricing" className="text-orange-200 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/help" className="text-orange-200 hover:text-white transition-colors">FAQ</Link></li>
                <li><a href="mailto:opulflow.inc@gmail.com" className="text-orange-200 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-orange-100">Contact</h4>
              <p className="text-orange-200 mb-2">Email: <a href="mailto:opulflow.inc@gmail.com" className="text-orange-300 hover:text-white transition-colors">opulflow.inc@gmail.com</a></p>
              <p className="text-orange-200">© {new Date().getFullYear()} OpulFlow Inc. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
