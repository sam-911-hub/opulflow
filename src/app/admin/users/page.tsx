"use client";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

interface User {
  id: string;
  email: string;
  accountType: 'free' | 'pro';
  createdAt: string;
  credits?: {
    ai?: number;
    leads?: number;
    exports?: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }) as User));
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <DataTable columns={columns} data={users} loading={loading} />
    </div>
  );
}