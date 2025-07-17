"use client";
import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
      // Get all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const totalUsers = usersSnapshot.docs.length;
      const users = usersSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().email;
        return acc;
      }, {} as Record<string, string>);
      
      // Collect transaction data
      let totalRevenue = 0;
      let totalTransactions = 0;
      const recentTransactions: any[] = [];
      
      for (const userId of Object.keys(users)) {
        const q = query(
          collection(db, `users/${userId}/transactions`),
          where("type", "==", "purchase"),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        totalTransactions += querySnapshot.size;
        
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.paymentDetails?.totalPrice) {
            totalRevenue += data.paymentDetails.totalPrice;
          }
          
          if (recentTransactions.length < 5) {
            recentTransactions.push({
              ...data,
              id: doc.id,
              userId,
              userEmail: users[userId]
            });
          }
        });
      }
      
      setStats({
        totalUsers,
        totalRevenue,
        totalTransactions,
        recentTransactions
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
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
    </div>
  );
}