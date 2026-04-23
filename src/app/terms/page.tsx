import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Header */}
      <div className="border-b border-[#30363d] bg-[#161b22]">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[#e6edf3]">Terms & Conditions</h1>
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
            <h2 className="text-2xl font-semibold text-[#e6edf3] mb-6">OpulFlow Terms & Conditions</h2>

            <div className="space-y-6 text-[#848d97]">
              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">Service Description</h3>
                <p className="leading-relaxed">
                  OpulFlow provides human-powered social media engagement services. All work is performed
                  by real humans, not automated tools or AI systems. We engage on social media platforms
                  to help grow your brand presence through authentic conversations.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">Payment Terms</h3>
                <p className="leading-relaxed">
                  Payment is required before service delivery begins. All payments are processed securely
                  through PayPal or M-Pesa. Credits for comment writing are purchased separately and do not expire.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">Service Delivery</h3>
                <p className="leading-relaxed">
                  We aim to complete all orders within the specified timeframe. Delays may occur due to
                  platform policies or technical issues. We provide screenshots and proof of all engagement activities.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">Prohibited Content</h3>
                <p className="leading-relaxed">
                  We do not engage with or promote illegal, harmful, or inappropriate content. All campaigns
                  must comply with platform terms of service and applicable laws.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">Refund Policy</h3>
                <p className="leading-relaxed">
                  Refunds are available within 48 hours of payment if services have not yet begun.
                  Once engagement activities start, refunds are not available. See our refund policy for details.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">Contact Information</h3>
                <p className="leading-relaxed">
                  For questions about these terms, please contact us at{' '}
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