"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

interface UserData {
  uid: string;
  email: string;
  credits?: number;
  accountType?: string;
}

interface Order {
  id: string;
  orderId: string;
  status: string;
  date: string;
  amount?: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      try {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid);
        const userData = userDoc.exists() ? userDoc.data() : {};

        setUser({
          uid: currentUser.uid,
          email: currentUser.email || '',
          credits: userData.credits || 0,
          accountType: userData.accountType || 'free',
        });

        // Fetch orders
        try {
          const ordersRes = await fetch('/api/orders');
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            setOrders(ordersData.orders || []);
          }
        } catch (e) {
          console.error('Error fetching orders:', e);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* User Info Card */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
        <p className="text-gray-700">Email: {user?.email}</p>
        <p className="text-gray-700">Account Type: {user?.accountType}</p>
      </div>

      {/* Credits Card */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Credits</h2>
        <p className="text-4xl font-bold text-orange-600 mb-4">{user?.credits || 0}</p>
        <button className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700">
          Buy Credits
        </button>
      </div>

      {/* Place Order Card */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Place New Order</h2>
        <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Place New Order
        </button>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders yet</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="flex justify-between border-b py-2">
                <span className="font-medium">{order.orderId}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
                <span className="text-gray-500">{order.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}