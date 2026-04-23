import Link from "next/link";

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-[#d1d9e0] px-4 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-semibold text-[#24292F]">
              OpulFlow
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/pricing" className="text-[#24292F] hover:text-[#0969DA] transition-colors">
                Pricing
              </Link>
              <Link href="/product" className="text-[#0969DA] font-medium">
                Product
              </Link>
              <Link href="/blog" className="text-[#24292F] hover:text-[#0969DA] transition-colors">
                Blog
              </Link>
              <Link href="/how-it-works" className="text-[#24292F] hover:text-[#0969DA] transition-colors">
                How it works
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-[#24292F] hover:text-[#0969DA] transition-colors">
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-[#24292F] text-white px-4 py-2 rounded-md hover:bg-[#1b1f23] transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Product Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#24292F] mb-4">Our Product</h1>
          <p className="text-xl text-[#656d76] max-w-2xl mx-auto">
            Human-powered lead discovery platform that connects your product with the perfect audience through personalized outreach.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[#24292F] mb-4">Targeted Outreach</h2>
            <p className="text-[#656d76] mb-4">
              Our human-powered approach ensures genuine connections with decision-makers who are actually interested in your product.
            </p>
            <ul className="space-y-2 text-[#656d76]">
              <li>• Personalized messaging based on prospect research</li>
              <li>• Multi-channel outreach (email, LinkedIn, phone)</li>
              <li>• Real-time feedback and optimization</li>
            </ul>
          </div>

          <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[#24292F] mb-4">Lead Intelligence</h2>
            <p className="text-[#656d76] mb-4">
              Advanced lead scoring and qualification to ensure you're connecting with high-value prospects.
            </p>
            <ul className="space-y-2 text-[#656d76]">
              <li>• Prospect intent and behavior analysis</li>
              <li>• Company size and industry targeting</li>
              <li>• Budget and timeline qualification</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="bg-[#24292F] text-white px-8 py-3 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
          >
            Start Your Campaign
          </Link>
        </div>
      </main>
    </div>
  );
}