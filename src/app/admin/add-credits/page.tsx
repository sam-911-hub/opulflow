"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

export default function AddCreditsPage() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [targetEmail, setTargetEmail] = useState("");
  const [creditsToAdd, setCreditsToAdd] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const auth = getFirebaseAuth();
    const adminEmailList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",");

    setAdminEmails(adminEmailList);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const userEmail = currentUser.email || "";
      
      // Only allow admin emails
      if (!adminEmailList.includes(userEmail)) {
        router.push('/dashboard');
        return;
      }

      setUser({ email: userEmail });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!targetEmail || !creditsToAdd) {
      setError("Please enter email and credits amount");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/add-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: targetEmail, creditsToAdd }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add credits');
      }

      setMessage(data.message || `Successfully added ${creditsToAdd} credits`);
      setTargetEmail("");
      setCreditsToAdd(0);
    } catch (err: any) {
      setError(err.message || "Failed to add credits");
    } finally {
      setSubmitting(false);
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
      <h1 className="text-3xl font-bold text-white mb-8">Add Credits to User</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
        <p className="text-gray-600 mb-4">Logged in as admin: {user?.email}</p>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Email
            </label>
            <input
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credits to Add
            </label>
            <input
              type="number"
              value={creditsToAdd}
              onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="0"
              min={1}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Adding Credits..." : "Add Credits"}
          </button>
        </form>
      </div>
    </div>
  );
}