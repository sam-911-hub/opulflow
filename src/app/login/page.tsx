"use client"

import { useState } from "react"
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebaseClient"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getUserFriendlyErrorMessage } from "@/lib/errorMessages"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter your email and password")
      return
    }

    setLoading(true)

    try {
      const auth = getFirebaseAuth()
      await setPersistence(auth, browserLocalPersistence)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      const idToken = await user.getIdToken()

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        throw new Error("Failed to create session")
      }

      router.push("/dashboard")
      } catch (err: unknown) {
        console.error("Login error:", err)
        const friendlyMessage = getUserFriendlyErrorMessage(err)
        setError(friendlyMessage)
     } finally {
       setLoading(false)
     }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
      <div className="bg-[#161b22] border border-[#30363d] p-8 rounded-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center text-[#e6edf3]">Sign in to OpulFlow</h1>

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
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#238636] hover:bg-[#2ea043] text-white py-2 px-6 rounded-md transition-colors font-medium disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <Link
              href="/forgot-password"
              className="text-[#2f81f7] hover:text-[#79c0ff] text-sm"
            >
              Forgot password?
            </Link>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#848d97]">
            New to OpulFlow?{" "}
            <Link href="/register" className="text-[#2f81f7] hover:text-[#79c0ff] font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}