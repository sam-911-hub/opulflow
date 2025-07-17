"use client";
import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  service: string;
  createdAt: string;
  remainingBalance: number;
  paymentDetails?: {
    packageName: string;
    serviceType: string;
    unitPrice: number;
    totalPrice: number;
    paymentMethod: string;
    purchaseDate: string;
  };
}

export default function TransactionHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const q = query(
        collection(db, `users/${user?.uid}/transactions`),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      setTransactions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Package</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
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
              <TableCell>{tx.remainingBalance}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}