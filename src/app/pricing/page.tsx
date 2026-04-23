import Link from "next/link";

export default function PricingPage() {
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
              <Link href="/pricing" className="text-[#0969DA] font-medium">
                Pricing
              </Link>
              <Link href="/product" className="text-[#24292F] hover:text-[#0969DA] transition-colors">
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

      {/* Pricing Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#24292F] mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-[#656d76] max-w-2xl mx-auto">
            Pay only for qualified leads that engage with your product.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[#24292F] mb-2">Starter</h2>
            <div className="text-3xl font-bold text-[#24292F] mb-4">$99<span className="text-lg font-normal text-[#656d76]">/month</span></div>
            <p className="text-[#656d76] mb-6">Perfect for startups and small businesses</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-[#656d76]">
                <svg className="w-5 h-5 text-[#0969DA] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                50 qualified leads
              </li>
              <li className="flex items-center text-[#656d76]">
                <svg className="w-5 h-5 text-[#0969DA] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Email outreach
              </li>
              <li className="flex items-center text-[#656d76]">
                <svg className="w-5 h-5 text-[#0969DA] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Basic reporting
              </li>
            </ul>
            <Link
              href="/register"
              className="w-full bg-[#24292F] text-white py-2 px-4 rounded-md hover:bg-[#1b1f23] transition-colors font-medium text-center block"
            >
              Get Started
            </Link>
          </div>

          <div className="bg-white border-2 border-[#0969DA] rounded-lg p-6 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#0969DA] text-white px-3 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>
            <h2 className="text-2xl font-semibold text-[#24292F] mb-2">Professional</h2>
            <div className="text-3xl font-bold text-[#24292F] mb-4">$299<span className="text-lg font-normal text-[#656d76]">/month</span></div>
            <p className="text-[#656d76] mb-6">Best for growing companies</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-[#656d76]">
                <svg className="w-5 h-5 text-[#0969DA] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                200 qualified leads
              </li>
              <li className="flex items-center text-[#656d76]">
                <svg className="w-5 h-5 text-[#0969DA] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Multi-channel outreach
              </li>
              <li className="flex items-center text-[#656d76]">
                <svg className="w-5 h-5 text-[#0969DA] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Advanced analytics
              </li>
              <li className="flex items-center text-[#656d76]">
                <svg className="w-5 h-5 text-[#0969DA] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority support
              </li>
            </ul>
            <Link
              href="/register"
              className="w-full bg-[#0969DA] text-white py-2 px-4 rounded-md hover:bg-[#0757c2] transition-colors font-medium text-center block"
            >
              Get Started
            </Link>
          </div>

          <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[#24292F] mb-2">Enterprise</h2>
            <div className="text-3xl font-bold text-[#24292F] mb-4">Custom<span className="text-lg font-normal text-[#656d76]">/month</span></div>
            <p className="text-[#656d76] mb-6">For large organizations with custom needs</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-[#656d76]">
                <svg className="w-5 h-5 text-[#0969DA] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited leads
              </li>
              <li className="flex items-center text-[#656d76]">
                <svg className="w-5 h-5 text-[#0969DA] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                White-label solution
              </li>
              <li className="flex items-center text-[#656d76]">
                <svg className="w-5 h-5 text-[#0969DA] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Custom integrations
              </li>
              <li className="flex items-center text-[#656d76]">
                <svg className="w-5 h-5 text-[#0969DA] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Dedicated account manager
              </li>
            </ul>
            <Link
              href="/register"
              className="w-full bg-[#24292F] text-white py-2 px-4 rounded-md hover:bg-[#1b1f23] transition-colors font-medium text-center block"
            >
              Contact Sales
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[#656d76] mb-4">All plans include our core features and 24/7 support.</p>
          <Link
            href="/register"
            className="text-[#0969DA] hover:text-[#0757c2] font-medium"
          >
            Start your free trial →
          </Link>
        </div>
      </main>
    </div>
  );
}