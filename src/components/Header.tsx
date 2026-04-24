"use client";

import { usePathname } from "next/navigation";
import BackButton from "@/components/BackButton";

export default function Header() {
  const pathname = usePathname();

  // Don't show back button on home page
  if (pathname === "/") {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <BackButton className="shadow-sm border border-gray-200" />
    </div>
  );
}