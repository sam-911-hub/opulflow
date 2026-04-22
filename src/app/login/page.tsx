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

  async function handleSubmit(e) {
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
    } catch (err) {
      console.error("Login error:", err)
      var errorCode = err.code || err.message

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-900 to-orange-800">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Sign In</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-orange-600 hover:text-orange-700 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}