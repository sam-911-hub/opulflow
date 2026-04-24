"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      // For now, just show a message that password reset is not implemented
      // In production, you would send a password reset email
      setMessage('Password reset functionality will be available soon. Please contact support at opulflow.inc@gmail.com for assistance.')
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
      <div className="bg-[#161b22] border border-[#30363d] p-8 rounded-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-[#e6edf3] mb-2">Reset your password</h1>
          <p className="text-[#848d97] text-sm">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {error && (
          <div className="bg-[#da3633] border border-[#f85149] text-white px-4 py-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-[#238636] border border-[#2ea043] text-white px-4 py-3 rounded-md mb-4 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#e6edf3] mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-2 px-4 rounded-md transition-colors font-medium disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset instructions"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-[#2f81f7] hover:text-[#79c0ff] text-sm">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}