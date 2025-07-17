import { auth } from "@/lib/firebase";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: Admin check disabled for testing
  // Add your email to ADMIN_EMAIL in .env.local to enable

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          <a href="/admin/users" className="block p-2 hover:bg-gray-100 rounded">
            Users
          </a>
          <a href="/admin/transactions" className="block p-2 hover:bg-gray-100 rounded">
            Transactions
          </a>
          <a href="/admin/analytics" className="block p-2 hover:bg-gray-100 rounded">
            Analytics
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}