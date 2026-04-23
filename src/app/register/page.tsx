"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: email.split("@")[0],
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: email.split("@")[0],
        createdAt: new Date().toISOString(),
        credits: 10,
        accountType: "free",
      });

      const idToken = await user.getIdToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      const errCode = err.code || err.message;
      
      if (errCode === "auth/email-already-in-use") {
        setError("Email is already registered");
      } else if (errCode === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (errCode === "auth/weak-password") {
        setError("Password is too weak");
      } else if (errCode === "auth/network-request-failed") {
        setError("Network error. Please check your connection");
      } else {
        setError("Failed to create account. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F8FA]">
      <div className="bg-white border border-[#d1d9e0] p-8 rounded-lg w-full max-w-md shadow-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center text-[#24292F]">Create your account</h1>

        {error && (
          <div className="bg-[#ffebe9] border border-[#ff8182] text-[#cf222e] px-4 py-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#24292F] mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="block w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA] focus:border-[#0969DA] bg-white"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#24292F] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="block w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA] focus:border-[#0969DA] bg-white"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#24292F] mb-2">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="block w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA] focus:border-[#0969DA] bg-white"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#24292F] text-white py-2 px-4 rounded-md hover:bg-[#1b1f23] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#656d76]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0969DA] hover:text-[#0757c2] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}