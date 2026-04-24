"use client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {children}
    </div>
  );
}