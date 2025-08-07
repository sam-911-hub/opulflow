"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AdminCreditManager from "@/components/AdminCreditManager";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    recentTransactions: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const totalUsers = usersSnapshot.docs.length;
      
      setStats({
        totalUsers,
        totalRevenue: 0,
        totalTransactions: 0,
        recentTransactions: []
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        totalUsers: 0,
        totalRevenue: 0,
        totalTransactions: 0,
        recentTransactions: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
            <p className="text-3xl font-bold">{stats.totalTransactions}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{tx.userEmail}</p>
                  <p className="text-sm text-gray-500">
                    {tx.paymentDetails?.packageName || tx.service} - {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-green-600 font-medium">
                  ${tx.paymentDetails?.totalPrice || 'N/A'}
                </div>
              </div>
            ))}
            
            <div className="pt-2">
              <Link href="/admin/transactions" className="text-blue-600 hover:underline">
                View all transactions →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AdminCreditManager />
    </div>
  );
}