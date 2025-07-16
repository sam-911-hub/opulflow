"use client";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, BellDot } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/notifications`),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
      setUnreadCount(notifs.length);
    });

    return () => unsubscribe();
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.map(notif => 
          updateDoc(doc(db, `users/${user?.uid}/notifications/${notif.id}`), {
            read: true
          })
        )
      );
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    }
  };

  return (
    <Popover>
      <PopoverTrigger className="relative">
        {unreadCount > 0 ? (
          <>
            <BellDot className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount}
            </span>
          </>
        ) : (
          <Bell className="h-5 w-5" />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2">
        <div className="flex justify-between items-center p-2 border-b">
          <h4 className="font-medium">Notifications</h4>
          <button 
            onClick={markAllAsRead}
            className="text-xs text-blue-500"
          >
            Mark all as read
          </button>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div key={notif.id} className="p-2 border-b">
                <p className="text-sm">{notif.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(notif.createdAt?.seconds * 1000).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-center text-gray-500">
              No new notifications
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}