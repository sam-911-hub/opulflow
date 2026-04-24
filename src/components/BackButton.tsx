"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
}

export default function BackButton({ className = "" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to home if no history
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors ${className}`}
      aria-label="Go back to previous page"
    >
      <ArrowLeft size={16} />
      <span className="hidden sm:inline">Back</span>
    </button>
  );
}