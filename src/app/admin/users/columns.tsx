interface User {
  email: string;
  accountType: 'free' | 'pro';
  createdAt: string;
  credits?: {
    ai?: number;
    leads?: number;
    exports?: number;
  };
}

interface CellContext {
  row: {
    original: User;
  };
}

export const columns = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "accountType",
    header: "Account Type",
    cell: ({ row }: CellContext) => (
      <span className={`px-2 py-1 rounded text-xs ${
        row.original.accountType === 'pro' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {row.original.accountType || 'free'}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }: CellContext) => row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : 'N/A',
  },
  {
    header: "Credits",
    cell: ({ row }: CellContext) => (
      <div className="text-sm">
        <div>AI: {row.original.credits?.ai || 0}</div>
        <div>Leads: {row.original.credits?.leads || 0}</div>
        <div>Exports: {row.original.credits?.exports || 0}</div>
      </div>
    ),
  },
]