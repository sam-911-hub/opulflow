"use client";
import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  service: string;
  createdAt: string;
  remainingBalance: number;
  userId?: string;
  userEmail?: string;
  paymentDetails?: {
    packageName: string;
    serviceType: string;
    unitPrice: number;
    totalPrice: number;
    paymentMethod: string;
    purchaseDate: string;
  };
}

export default function AdminTransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'purchase' | 'consumption'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user, filter, dateRange]);

  const fetchTransactions = async () => {
    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().email;
        return acc;
      }, {} as Record<string, string>);
      
      // Prepare date filter if needed
      let startDate: Date | null = null;
      if (dateRange === 'today') {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'week') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
      }
      
      // Collect all transactions
      const allTransactions: Transaction[] = [];
      
      for (const userId of Object.keys(users)) {
        let q = query(
          collection(db, `users/${userId}/transactions`),
          orderBy("createdAt", "desc")
        );
        
        // Apply type filter if needed
        if (filter !== 'all') {
          q = query(q, where("type", "==", filter));
        }
        
        const querySnapshot = await getDocs(q);
        
        querySnapshot.docs.forEach(doc => {
          const data = doc.data() as Transaction;
          
          // Apply date filter if needed
          if (startDate && new Date(data.createdAt) < startDate) {
            return;
          }
          
          allTransactions.push({
            ...data,
            id: doc.id,
            userId,
            userEmail: users[userId]
          });
        });
      }
      
      // Sort by date
      allTransactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "User Email",
      "Type",
      "Service",
      "Package",
      "Service Type",
      "Amount",
      "Price",
      "Payment Method",
      "Date",
      "Balance"
    ].join(",");
    
    const rows = transactions.map(tx => [
      tx.userEmail || "",
      tx.type,
      tx.service,
      tx.paymentDetails?.packageName || "",
      tx.paymentDetails?.serviceType || "",
      tx.amount,
      tx.paymentDetails?.totalPrice || "",
      tx.paymentDetails?.paymentMethod || "",
      new Date(tx.createdAt).toLocaleString(),
      tx.remainingBalance
    ].join(","));
    
    const csvContent = [headers, ...rows].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `opulflow-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  if (loading) return <div className="p-8">Loading transactions...</div>;

  // Calculate summary statistics
  const totalRevenue = transactions
    .filter(tx => tx.type === 'purchase' && tx.paymentDetails)
    .reduce((sum, tx) => sum + (tx.paymentDetails?.totalPrice || 0), 0);
    
  const purchaseCount = transactions.filter(tx => tx.type === 'purchase').length;
  
  const serviceRevenue = transactions
    .filter(tx => tx.type === 'purchase' && tx.paymentDetails)
    .reduce((acc, tx) => {
      const service = tx.paymentDetails?.serviceType || 'Unknown';
      acc[service] = (acc[service] || 0) + (tx.paymentDetails?.totalPrice || 0);
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Transaction Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Purchases</h3>
            <p className="text-3xl font-bold">{purchaseCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <p className="text-3xl font-bold">{new Set(transactions.map(tx => tx.userId)).size}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'purchase' ? 'default' : 'outline'} 
            onClick={() => setFilter('purchase')}
          >
            Purchases
          </Button>
          <Button 
            variant={filter === 'consumption' ? 'default' : 'outline'} 
            onClick={() => setFilter('consumption')}
          >
            Usage
          </Button>
        </div>
        
        <div className="space-x-2">
          <Button 
            variant={dateRange === 'all' ? 'default' : 'outline'} 
            onClick={() => setDateRange('all')}
          >
            All Time
          </Button>
          <Button 
            variant={dateRange === 'month' ? 'default' : 'outline'} 
            onClick={() => setDateRange('month')}
          >
            Last 30 Days
          </Button>
          <Button 
            variant={dateRange === 'week' ? 'default' : 'outline'} 
            onClick={() => setDateRange('week')}
          >
            Last 7 Days
          </Button>
          <Button 
            variant={dateRange === 'today' ? 'default' : 'outline'} 
            onClick={() => setDateRange('today')}
          >
            Today
          </Button>
        </div>
        
        <Button onClick={exportToCSV}>Export CSV</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={`${tx.userId}-${tx.id}`}>
                    <TableCell>{tx.userEmail}</TableCell>
                    <TableCell className="capitalize">{tx.type}</TableCell>
                    <TableCell className="capitalize">{tx.service}</TableCell>
                    <TableCell>
                      {tx.paymentDetails ? (
                        <div className="text-xs">
                          <div className="font-medium">{tx.paymentDetails.packageName}</div>
                          <div className="text-gray-500">{tx.paymentDetails.serviceType}</div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className={tx.type === "purchase" ? "text-green-500" : "text-red-500"}>
                      {tx.type === "purchase" ? "+" : "-"}{tx.amount}
                    </TableCell>
                    <TableCell>
                      {tx.paymentDetails ? (
                        `$${tx.paymentDetails.totalPrice}`
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="capitalize">
                      {tx.paymentDetails?.paymentMethod || "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(tx.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(serviceRevenue).map(([service, revenue]) => (
                  <TableRow key={service}>
                    <TableCell className="capitalize">{service}</TableCell>
                    <TableCell>${revenue.toFixed(2)}</TableCell>
                    <TableCell>
                      {totalRevenue > 0 ? `${((revenue / totalRevenue) * 100).toFixed(1)}%` : '0%'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}