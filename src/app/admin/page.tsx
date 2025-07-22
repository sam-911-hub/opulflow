"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  id: string;
  email: string;
  accountType: 'free' | 'pro';
  createdAt: string;
  credits?: Record<string, number>;
}

interface Transaction {
  id: string;
  userId: string;
  type: 'purchase' | 'usage';
  amount: number;
  service: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Use API route instead of direct Firestore access in client component
      const [usersResponse, transactionsResponse] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/transactions')
      ]);

      if (!usersResponse.ok || !transactionsResponse.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const users: User[] = await usersResponse.json();
      const transactions: Transaction[] = await transactionsResponse.json();

      // Calculate stats
      const activeUsers = users.filter(user => 
        user.accountType === 'pro' || 
        (user.credits && Object.values(user.credits).some(credit => credit > 0))
      ).length;

      const totalRevenue = transactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0);

      setStats({
        totalUsers: users.length,
        activeUsers,
        totalTransactions: transactions.length,
        totalRevenue,
      });

      setRecentUsers(users.slice(0, 10));
      setRecentTransactions(transactions.slice(0, 10));
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.accountType}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{transaction.service}</div>
                    <div className="text-sm text-gray-500">{transaction.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${transaction.amount}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}