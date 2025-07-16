export const columns = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "accountType",
    header: "Account Type",
    cell: (row: any) => (
      <span className={`px-2 py-1 rounded text-xs ${
        row.accountType === 'pro' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {row.accountType || 'free'}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A',
  },
  {
    header: "Credits",
    cell: (row: any) => (
      <div className="text-sm">
        <div>AI: {row.credits?.ai || 0}</div>
        <div>Leads: {row.credits?.leads || 0}</div>
        <div>Exports: {row.credits?.exports || 0}</div>
      </div>
    ),
  },
]