"use client";
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  type: 'purchase' | 'usage';
  amount: number;
  service: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'purchase' | 'usage'>('all');

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = transactions.filter(transaction => 
    filter === 'all' || transaction.type === filter
  );

  const exportCSV = () => {
    const headers = ['ID', 'User Email', 'Type', 'Amount', 'Service', 'Status', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(tx => [
        tx.id,
        tx.userEmail,
        tx.type,
        tx.amount,
        tx.service,
        tx.status,
        new Date(tx.createdAt).toISOString()
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading transactions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Button onClick={exportCSV}>Export CSV</Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All ({transactions.length})
        </Button>
        <Button 
          variant={filter === 'purchase' ? 'default' : 'outline'}
          onClick={() => setFilter('purchase')}
        >
          Purchases ({transactions.filter(t => t.type === 'purchase').length})
        </Button>
        <Button 
          variant={filter === 'usage' ? 'default' : 'outline'}
          onClick={() => setFilter('usage')}
        >
          Usage ({transactions.filter(t => t.type === 'usage').length})
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-2 text-left">ID</th>
                  <th className="border border-gray-200 p-2 text-left">User</th>
                  <th className="border border-gray-200 p-2 text-left">Type</th>
                  <th className="border border-gray-200 p-2 text-left">Amount</th>
                  <th className="border border-gray-200 p-2 text-left">Service</th>
                  <th className="border border-gray-200 p-2 text-left">Status</th>
                  <th className="border border-gray-200 p-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-2 font-mono text-sm">
                      {transaction.id.substring(0, 8)}...
                    </td>
                    <td className="border border-gray-200 p-2">{transaction.userEmail}</td>
                    <td className="border border-gray-200 p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.type === 'purchase' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="border border-gray-200 p-2">${transaction.amount}</td>
                    <td className="border border-gray-200 p-2">{transaction.service}</td>
                    <td className="border border-gray-200 p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="border border-gray-200 p-2">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No transactions found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}