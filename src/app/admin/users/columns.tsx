export const columns = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: (row: any) => row.name || 'Not set',
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: (row: any) => row.phone || 'Not set',
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
        <div>AI: {row.credits?.ai_email || 0}</div>
        <div>Leads: {row.credits?.lead_lookup || 0}</div>
        <div>Company: {row.credits?.company_enrichment || 0}</div>
        <div>Email: {row.credits?.email_verification || 0}</div>
      </div>
    ),
  },
]