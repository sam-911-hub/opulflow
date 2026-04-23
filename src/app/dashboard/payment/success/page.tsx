"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard after a short delay
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-[#238636] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-[#e6edf3] mb-4">Payment Successful!</h1>
        <p className="text-[#848d97] mb-6">
          Your order has been processed successfully. We'll start working on your request right away.
        </p>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full bg-[#238636] hover:bg-[#2ea043] text-white py-3 px-6 rounded-md transition-colors font-medium"
          >
            View My Orders
          </Link>

          <Link
            href="/dashboard"
            className="block w-full bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] py-3 px-6 rounded-md transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        <p className="text-sm text-[#848d97] mt-6">
          Redirecting to dashboard in 3 seconds...
        </p>
      </div>
    </div>
  )
}