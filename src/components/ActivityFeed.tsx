"use client";
import { useAuth } from "@/context/AuthContext";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ActivityFeed() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/transactions`),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActivities(snapshot.docs.map(doc => doc.data()));
    }, (error) => {
      toast.error("Error loading activities");
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`w-2 h-2 mt-2 rounded-full ${
              activity.type === 'purchase' ? 'bg-green-500' : 'bg-blue-500'
            }`} />
            <div>
              <p className="text-sm">
                {activity.type === 'purchase' ? 'Purchased' : 'Used'} {activity.amount} {activity.service} credits
              </p>
              <p className="text-xs text-gray-500">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}