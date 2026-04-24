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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <BackButton />
    </header>
  );
}