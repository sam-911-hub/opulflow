"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { initFirestoreSchema } from "@/lib/initFirestore"; // New import

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        accountType: "free",
        credits: {
          ai_email: 0,
          lead_lookup: 0,
          company_enrichment: 0,
          email_verification: 0,
          workflow: 0,
          crm_sync: 0
        },
        usage: {
          leads: 0,
          enrichment: 0,
          workflowRuns: 0,
          emailWriter: 0,
          callScripts: 0
        },
        createdAt: new Date().toISOString(),
        resetDate: new Date().toISOString() // For monthly limits
      });

      // Initialize team and member relationships
      await initFirestoreSchema(userCredential.user.uid);

      toast.success("Account created successfully. Welcome to OpulFlow!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Provide more user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        toast.error("This email address is already registered. Please sign in or use a different email.");
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Please enter a valid email address.");
      } else if (error.code === 'auth/weak-password') {
        toast.error("Password must be at least 6 characters long with a mix of letters and numbers.");
      } else {
        toast.error(error.message || "Account creation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component remains exactly the same
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create OpulFlow Account</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}