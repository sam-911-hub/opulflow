import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuth, isUserAdmin } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get session cookie
  const sessionCookie = cookies().get('session')?.value;
  
  // If no session cookie, redirect to login
  if (!sessionCookie) {
    redirect('/login');
  }
  
  try {
    // Verify session cookie
    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
    
    // Check if user is admin
    const isAdmin = await isUserAdmin(decodedClaims.uid);
    
    // If not admin, redirect to home
    if (!isAdmin) {
      redirect('/');
    }
  } catch (error) {
    // Invalid session cookie, redirect to login
    redirect('/login');
  }

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