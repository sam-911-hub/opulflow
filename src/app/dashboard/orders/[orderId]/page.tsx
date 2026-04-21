"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

interface OrderDetails {
  id: string;
  orderId: string;
  userEmail: string;
  productName: string;
  platforms: string[];
  quantity: number;
  tone: string;
  instructions: string;
  totalCost: number;
  creditsUsed: number;
  status: string;
  createdAt: string;
}

export default function OrderDetailPage() {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  useEffect(() => {
    const auth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to load order');
        }
      } catch (e) {
        console.error('Error fetching order:', e);
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, orderId]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">Order Details</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link
          href="/dashboard/orders"
          className="text-orange-600 hover:text-orange-700"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/orders"
        className="text-orange-400 hover:text-orange-300 mb-4 inline-block"
      >
        ← Back to Orders
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Order Details</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
        {/* Order ID and Status */}
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="text-xl font-bold">{order?.orderId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Status</p>
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              order?.status === 'completed' ? 'bg-green-100 text-green-800' :
              order?.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
              order?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order?.status}
            </span>
          </div>
        </div>

        {/* Date */}
        <div>
          <p className="text-sm text-gray-500">Order Date</p>
          <p className="font-medium">{order?.createdAt ? formatDate(order.createdAt) : 'N/A'}</p>
        </div>

        {/* Product */}
        <div>
          <p className="text-sm text-gray-500">Product/Service</p>
          <p className="font-medium">{order?.productName}</p>
        </div>

        {/* Platforms */}
        <div>
          <p className="text-sm text-gray-500">Target Platforms</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {order?.platforms?.map((platform) => (
              <span key={platform} className="bg-gray-100 px-2 py-1 rounded text-sm">
                {platform}
              </span>
            ))}
          </div>
        </div>

        {/* Quantity and Tone */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Quantity</p>
            <p className="font-medium">{order?.quantity} comments</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tone</p>
            <p className="font-medium">{order?.tone}</p>
          </div>
        </div>

        {/* Special Instructions */}
        <div>
          <p className="text-sm text-gray-500">Special Instructions</p>
          <p className="font-medium">{order?.instructions || 'None'}</p>
        </div>

        {/* Cost */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500">Total Cost</p>
          <p className="text-2xl font-bold text-orange-600">{order?.totalCost} credits</p>
        </div>

        {/* Completed message */}
        {order?.status === 'completed' && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-medium">Order Completed!</p>
            <p className="text-sm mt-1">
              Your deliverables have been sent to your email. Please check your inbox.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}