import Link from "next/link"

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="border-b border-[#30363d] bg-[#161b22]">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[#e6edf3]">Accessibility Statement</h1>
            <Link href="/" className="text-[#2f81f7] hover:text-[#79c0ff] text-sm">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-8">
            <h2 className="text-2xl font-semibold text-[#e6edf3] mb-6">Accessibility Statement</h2>

            <div className="space-y-6 text-[#848d97]">
              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">Commitment to Accessibility</h3>
                <p className="leading-relaxed">
                  OpulFlow is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">Conformance Status</h3>
                <p className="leading-relaxed">
                  We aim to conform to Web Content Accessibility Guidelines (WCAG) 2.1 level AA. These guidelines explain how to make web content more accessible to people with disabilities.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">Feedback</h3>
                <p className="leading-relaxed">
                  We welcome your feedback on the accessibility of OpulFlow. Please contact us if you encounter accessibility barriers:{' '}
                  <a href="mailto:opulflow.inc@gmail.com" className="text-[#2f81f7] hover:text-[#79c0ff]">
                    opulflow.inc@gmail.com
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#e6edf3] mb-3">Technical Specifications</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Support for screen readers</li>
                  <li>Keyboard navigation</li>
                  <li>High contrast mode option</li>
                  <li>Adjustable font sizes</li>
                  <li>Alternative text for images</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}