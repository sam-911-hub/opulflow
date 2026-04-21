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
    <div className="min-h-screen bg-gradient-to-br from-orange-900 to-orange-800">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
          <div className="mb-8">
            <h1 className="text-xl font-bold">OpulFlow</h1>
          </div>
          
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="block py-2 px-4 rounded hover:bg-orange-700"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/orders"
              className="block py-2 px-4 rounded hover:bg-orange-700"
            >
              Orders
            </Link>
          </nav>

          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 py-2 px-4 rounded hover:bg-red-700"
            >
              Logout
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