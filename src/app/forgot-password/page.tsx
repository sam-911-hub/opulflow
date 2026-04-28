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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl border border-slate-200 rounded-[2rem] p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl font-bold mx-auto mb-4">
              OP
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">Reset your password</h1>
            <p className="text-slate-600">Enter your email below to receive password reset instructions.</p>
          </div>

          {error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-4 mb-6 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 mb-6 text-sm text-emerald-700">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                placeholder="Enter your email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-white font-semibold shadow-lg shadow-blue-200/20 transition hover:shadow-xl disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send reset instructions'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>
              Prefer direct help? Email <a href="mailto:opulflow.inc@gmail.com" className="font-medium text-blue-600 hover:text-blue-700">opulflow.inc@gmail.com</a>
            </p>
            <p className="mt-3">
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                ← Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}