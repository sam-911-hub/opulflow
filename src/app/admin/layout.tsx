export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          <a href="/admin" className="block p-2 hover:bg-gray-100 rounded">
            Dashboard
          </a>
          <a href="/admin/users" className="block p-2 hover:bg-gray-100 rounded">
            Users
          </a>
          <a href="/admin/transactions" className="block p-2 hover:bg-gray-100 rounded">
            Transactions
          </a>
          <a href="/admin/analytics" className="block p-2 hover:bg-gray-100 rounded">
            Analytics
          </a>
          <a href="/dashboard" className="block p-2 hover:bg-gray-100 rounded">
            Back to Dashboard
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}