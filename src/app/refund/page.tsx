import Link from "next/link"

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Header */}
      <div className="border-b border-[#30363d] bg-[#161b22]">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[#e6edf3]">Refund Policy</h1>
            <Link href="/" className="text-[#2f81f7] hover:text-[#79c0ff] text-sm">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-8">
            <h2 className="text-2xl font-semibold text-[#e6edf3] mb-6">OpulFlow Refund Policy</h2>

            <div className="space-y-6 text-[#848d97]">
              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">General Refund Policy</h3>
                <p className="leading-relaxed">
                  We strive to provide excellent service to all our clients. Refunds are available under
                  specific circumstances as outlined below.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">When Refunds Are Available</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Full refund within 48 hours if no work has begun on your order</li>
                  <li>Partial refund if technical issues prevent service completion</li>
                  <li>Refund for duplicate or incorrect charges</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">When Refunds Are Not Available</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Once engagement activities have started</li>
                  <li>For completed orders where proof has been delivered</li>
                  <li>For credit purchases (credits do not expire)</li>
                  <li>If platform policies prevent engagement</li>
                  <li>If client requests changes after work begins</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">How to Request a Refund</h3>
                <p className="leading-relaxed">
                  To request a refund, contact us within 7 days of payment at{' '}
                  <a href="mailto:opulflow.inc@gmail.com" className="text-[#2f81f7] hover:text-[#79c0ff]">
                    opulflow.inc@gmail.com
                  </a>{' '}
                  with your order ID and reason for the refund request. We will review your request
                  and respond within 2 business days.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">Processing Time</h3>
                <p className="leading-relaxed">
                  Approved refunds are processed within 5-7 business days and will be returned
                  to the original payment method (PayPal or M-Pesa).
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">Contact Information</h3>
                <p className="leading-relaxed">
                  For refund requests or questions about this policy, please contact us at{' '}
                  <a href="mailto:opulflow.inc@gmail.com" className="text-[#2f81f7] hover:text-[#79c0ff]">
                    opulflow.inc@gmail.com
                  </a>
                </p>
              </div>

              <div className="pt-6 border-t border-[#30363d]">
                <p className="text-sm text-[#848d97]">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}