"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import { getUserFriendlyErrorMessage } from "@/lib/errorMessages";
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
    const startTime = Date.now();

    try {
      console.log("Starting registration process...");
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();

      // Step 1: Create user account
      console.log("Creating user account...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User account created, UID:", user.uid, "in", Date.now() - startTime, "ms");

      // Step 2: Update profile (optional)
      updateProfile(user, {
        displayName: email.split("@")[0],
      }).catch(profileError => {
        console.error("Profile update error:", profileError);
        // Profile update is optional, continue
      });

      // Step 3: Create user document with robust offline handling
      console.log("Creating user document...");
      const firestoreDb = getFirebaseDb();
      const userDocRef = doc(firestoreDb, 'users', user.uid);

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: email.split("@")[0],
        credits: 20,
        freeCreditsGiven: true,
        accountType: "free",
        createdAt: new Date().toISOString(),
      };

      // Store in localStorage immediately as backup
      localStorage.setItem(`pendingUserDoc_${user.uid}`, JSON.stringify(userData));

      // Try to write to Firestore with timeout, but don't block registration
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore operation timed out')), 60000)
        );

        await Promise.race([setDoc(userDocRef, userData), timeoutPromise]);
        console.log("✅ User document created successfully");
        localStorage.removeItem(`pendingUserDoc_${user.uid}`);
      } catch (firestoreError: any) {
        console.warn("⚠️ Firestore write failed or timed out, but user can still use the app:", firestoreError.message);
        // Keep the backup in localStorage - it will be synced by the dashboard
      }

      // Step 4: Get ID token and create session
      console.log("Getting ID token and creating session...");
      try {
        const idToken = await user.getIdToken();
        console.log("ID token obtained");

        const sessionResponse = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        if (!sessionResponse.ok) {
          const errorText = await sessionResponse.text();
          console.error("Session creation failed:", sessionResponse.status, errorText);
          throw new Error('Failed to create session');
        }

        console.log("Session created successfully");
      } catch (sessionError) {
        console.warn("Session creation failed, but user account is created:", sessionError);
        // Continue to dashboard - the dashboard will handle auth checks
      }

      console.log("Registration completed in", Date.now() - startTime, "ms");
      console.log("Redirecting to dashboard...");
      router.push("/dashboard");
      console.log("Router.push called");
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const friendlyMessage = getUserFriendlyErrorMessage(err);
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
      <div className="bg-[#161b22] border border-[#30363d] p-8 rounded-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center text-[#e6edf3]">Create your account</h1>

        {error && (
          <div className="bg-[#da3633] border border-[#f85149] text-white px-4 py-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#e6edf3] mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="block w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#e6edf3] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="block w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#e6edf3] mb-2">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="block w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
              placeholder="Confirm your password"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-2 px-4 rounded-md transition-colors font-medium disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#848d97]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#2f81f7] hover:text-[#79c0ff] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}