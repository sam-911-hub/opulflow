"use client";
import { useAuth } from "@/context/AuthContext";

export default function AdminTestPage() {
  const { user } = useAuth();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p><strong>Current User Email:</strong> {user?.email || 'Not logged in'}</p>
        <p><strong>Admin Emails:</strong> opulflow.inc@gmail.com</p>
        <p><strong>Is Admin:</strong> {user?.email === 'opulflow.inc@gmail.com' ? 'YES' : 'NO'}</p>
      </div>
    </div>
  );
}