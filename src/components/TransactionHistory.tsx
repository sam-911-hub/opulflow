"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: string;
  credits: number;
  amount?: number;
  service?: string;
  timestamp: string;
  paymentMethod?: string;
  orderId?: string;
}

interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    limit: 10,
    offset: 0,
    total: 0,
    hasMore: false
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async (offset = 0) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/credits/history?limit=${pagination.limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transaction history');
      }
      
      const data = await response.json();
      setTransactions(data.transactions || []);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError('Failed to load transaction history');
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  const handleNextPage = () => {
    if (pagination.hasMore) {
      const newOffset = pagination.offset + pagination.limit;
      fetchTransactions(newOffset);
    }
  };
  
  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      const newOffset = Math.max(0, pagination.offset - pagination.limit);
      fetchTransactions(newOffset);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        <p>{error}</p>
        <button 
          onClick={() => fetchTransactions(pagination.offset)} 
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Order ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="capitalize font-medium">{tx.type}</TableCell>
                <TableCell className={tx.type === "purchase" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {tx.type === "purchase" ? "+" : "-"}{tx.credits}
                </TableCell>
                <TableCell className="capitalize">{tx.service || "-"}</TableCell>
                <TableCell className="capitalize">{tx.paymentMethod || "-"}</TableCell>
                <TableCell>
                  {new Date(tx.timestamp).toLocaleString()}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {tx.orderId || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Showing {pagination.offset + 1} to {Math.min(pagination.offset + transactions.length, pagination.total)} of {pagination.total} transactions
        </p>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={pagination.offset === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={!pagination.hasMore}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}