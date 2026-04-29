"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BuyCreditsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard - credits system has been removed
    // Now using pay-as-you-go model instead
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 text-lg">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}