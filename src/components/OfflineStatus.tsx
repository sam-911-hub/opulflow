"use client";

import { useState, useEffect } from "react";
import { offlinePersistence } from "@/lib/offlinePersistence";

export default function OfflineStatus() {
  const [status, setStatus] = useState({ pendingCount: 0, isProcessing: false });
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // Update status periodically
    const updateStatus = () => {
      setStatus(offlinePersistence.getStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  // Only show in development or when there are pending writes
  if (process.env.NODE_ENV === 'production' && status.pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-mono z-50">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>
      {status.pendingCount > 0 && (
        <div className="mt-1">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${status.isProcessing ? 'bg-blue-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            <span>{status.pendingCount} pending</span>
          </div>
        </div>
      )}
    </div>
  );
}