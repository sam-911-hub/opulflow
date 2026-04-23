"use client"

import { useState } from "react"
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebaseClient"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  var [email, setEmail] = useState("")
  var [password, setPassword] = useState("")
  var [loading, setLoading] = useState(false)
  var [error, setError] = useState("")
  var router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter your email and password")
      return
    }

    setLoading(true)

    try {
      var auth = getFirebaseAuth()
      await setPersistence(auth, browserLocalPersistence)

      var userCredential = await signInWithEmailAndPassword(auth, email, password)
      var user = userCredential.user

      var idToken = await user.getIdToken()

      var response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        throw new Error("Failed to create session")
      }

      router.push("/dashboard")
     } catch (err: any) {
       console.error("Login error:", err)
       const errorCode = err.code || err.message

       if (errorCode === "auth/user-not-found" || errorCode === "auth/wrong-password" || errorCode === "auth/invalid-login-credentials") {
         setError("Invalid email or password")
       } else if (errorCode === "auth/invalid-email") {
         setError("Invalid email address")
       } else if (errorCode === "auth/network-request-failed") {
         setError("Network error. Please check your connection")
       } else if (errorCode === "auth/too-many-requests") {
         setError("Too many failed attempts. Please try again later")
       } else {
         setError("Login failed. Please check your credentials")
       }
     } finally {
       setLoading(false)
     }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F8FA]">
      <div className="bg-white border border-[#d1d9e0] p-8 rounded-lg w-full max-w-md shadow-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center text-[#24292F]">Sign in to OpulFlow</h1>

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
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA] focus:border-[#0969DA] bg-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#24292F] text-white py-2 px-4 rounded-md hover:bg-[#1b1f23] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#656d76]">
            New to OpulFlow?{" "}
            <Link href="/register" className="text-[#0969DA] hover:text-[#0757c2] font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}