"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-[#bb8009] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-[#e6edf3] mb-4">Payment Cancelled</h1>
        <p className="text-[#848d97] mb-6">
          Your payment was cancelled. No charges were made to your account.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="block w-full bg-[#2f81f7] hover:bg-[#79c0ff] text-white py-3 px-6 rounded-md transition-colors font-medium"
          >
            Try Payment Again
          </button>

          <Link
            href="/dashboard"
            className="block w-full bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] py-3 px-6 rounded-md transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}