"use client";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    proUsers: 0,
    totalTransactions: 0,
    totalCreditsUsed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.map(doc => doc.data());
      
      const totalUsers = users.length;
      const proUsers = users.filter(user => user.accountType === 'pro').length;
      
      // Get all transactions (simplified - in production you'd aggregate this better)
      let totalTransactions = 0;
      let totalCreditsUsed = 0;
      
      for (const user of users) {
        try {
          const transactionsSnapshot = await getDocs(
            collection(db, `users/${user.uid}/transactions`)
          );
          totalTransactions += transactionsSnapshot.size;
          
          transactionsSnapshot.docs.forEach(doc => {
            const transaction = doc.data();
            if (transaction.type === 'consumption') {
              totalCreditsUsed += transaction.amount;
            }
          });
        } catch (error) {
          // Skip if user has no transactions
        }
      }
      
      setStats({
        totalUsers,
        proUsers,
        totalTransactions,
        totalCreditsUsed
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.proUsers}</div>
            <p className="text-xs text-gray-500">
              {stats.totalUsers > 0 ? Math.round((stats.proUsers / stats.totalUsers) * 100) : 0}% conversion
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalTransactions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalCreditsUsed}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Free Users</span>
              <span className="font-medium">{stats.totalUsers - stats.proUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pro Users</span>
              <span className="font-medium text-purple-600">{stats.proUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Conversion Rate</span>
              <span className="font-medium">
                {stats.totalUsers > 0 ? Math.round((stats.proUsers / stats.totalUsers) * 100) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}