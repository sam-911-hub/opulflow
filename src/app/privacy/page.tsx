import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Header */}
      <div className="border-b border-[#30363d] bg-[#161b22]">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[#e6edf3]">Privacy Policy</h1>
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
            <h2 className="text-2xl font-semibold text-[#e6edf3] mb-6">OpulFlow Privacy Policy</h2>

            <div className="space-y-6 text-[#848d97]">
              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">Information We Collect</h3>
                <p className="leading-relaxed">
                  OpulFlow collects minimal personal information necessary to provide our human-powered
                  social media engagement services. This includes your email address for account creation
                  and service communication.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">How We Use Your Information</h3>
                <p className="leading-relaxed">
                  Your information is used solely for:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Account management and service delivery</li>
                  <li>Order processing and payment verification</li>
                  <li>Customer support communications</li>
                  <li>Service updates and notifications</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">Data Security</h3>
                <p className="leading-relaxed">
                  We implement appropriate security measures to protect your personal information.
                  All payment processing is handled securely through PayPal and M-Pesa.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">Contact Us</h3>
                <p className="leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at{' '}
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