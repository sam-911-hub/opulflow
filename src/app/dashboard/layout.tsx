"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-[#d1d9e0] min-h-screen p-4">
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-[#24292F]">OpulFlow</h1>
          </div>

          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="block py-2 px-3 rounded-md hover:bg-[#f6f8fa] text-[#24292F] hover:text-[#0969DA] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/orders"
              className="block py-2 px-3 rounded-md hover:bg-[#f6f8fa] text-[#24292F] hover:text-[#0969DA] transition-colors"
            >
              Orders
            </Link>
            <Link
              href="/dashboard/buy-credits"
              className="block py-2 px-3 rounded-md hover:bg-[#f6f8fa] text-[#24292F] hover:text-[#0969DA] transition-colors"
            >
              Buy Credits
            </Link>
            <Link
              href="/dashboard/settings"
              className="block py-2 px-3 rounded-md hover:bg-[#f6f8fa] text-[#24292F] hover:text-[#0969DA] transition-colors"
            >
              Settings
            </Link>
          </nav>

          <div className="mt-auto pt-8">
            <button
              onClick={handleLogout}
              className="w-full bg-[#dc3545] text-white py-2 px-3 rounded-md hover:bg-[#c82333] transition-colors"
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}