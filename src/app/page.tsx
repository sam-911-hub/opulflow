"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            OpulFlow
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Next-gen sales intelligence platform for modern teams
          </p>
          <p className="text-lg font-medium text-indigo-600 mb-8">
            Only pay for what you use - No subscriptions, no lock-in
          </p>
          <div className="space-x-4">
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium border border-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-blue-500">
            <h3 className="text-xl font-semibold mb-3">Sales Intelligence</h3>
            <p className="text-gray-600">Lead lookup, company enrichment, and email verification</p>
            <p className="text-sm text-blue-600 mt-2">From $0.25/lead</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-purple-500">
            <h3 className="text-xl font-semibold mb-3">AI-Powered Tools</h3>
            <p className="text-gray-600">Email generation, call scripts, and sales coaching</p>
            <p className="text-sm text-purple-600 mt-2">From $0.10/generation</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-green-500">
            <h3 className="text-xl font-semibold mb-3">CRM & Automation</h3>
            <p className="text-gray-600">Mini CRM, workflow automation, and email sequences</p>
            <p className="text-sm text-green-600 mt-2">Bundles from $20</p>
          </div>
        </div>
      </div>
    </div>
  );
}
