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
      className={`flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors ${className}`}
      aria-label="Go back to previous page"
    >
      <ArrowLeft size={14} />
    </button>
  );
}