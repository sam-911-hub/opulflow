import Link from "next/link";

export default function HowItWorksPage() {
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
              <Link href="/product" className="text-[#24292F] hover:text-[#0969DA] transition-colors">
                Product
              </Link>
              <Link href="/blog" className="text-[#24292F] hover:text-[#0969DA] transition-colors">
                Blog
              </Link>
              <Link href="/how-it-works" className="text-[#0969DA] font-medium">
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

      {/* How It Works Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#24292F] mb-4">How It Works</h1>
          <p className="text-xl text-[#656d76] max-w-2xl mx-auto">
            Our simple 4-step process to get your product in front of the right people.
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col md:flex-row items-center bg-white border border-[#d1d9e0] rounded-lg p-6">
            <div className="flex-shrink-0 w-16 h-16 bg-[#0969DA] rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#24292F] mb-2">Define Your Target</h2>
              <p className="text-[#656d76]">
                Tell us about your ideal customer profile, industry, company size, and key decision-makers you want to reach.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center bg-white border border-[#d1d9e0] rounded-lg p-6">
            <div className="flex-shrink-0 w-16 h-16 bg-[#0969DA] rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#24292F] mb-2">AI-Powered Research</h2>
              <p className="text-[#656d76]">
                Our system identifies and qualifies prospects using advanced algorithms and human verification.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center bg-white border border-[#d1d9e0] rounded-lg p-6">
            <div className="flex-shrink-0 w-16 h-16 bg-[#0969DA] rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#24292F] mb-2">Human Outreach</h2>
              <p className="text-[#656d76]">
                Our team of experienced sales professionals personally reaches out with customized messaging.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center bg-white border border-[#d1d9e0] rounded-lg p-6">
            <div className="flex-shrink-0 w-16 h-16 bg-[#0969DA] rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6">
              <span className="text-2xl font-bold text-white">4</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#24292F] mb-2">Track & Optimize</h2>
              <p className="text-[#656d76]">
                Monitor campaign performance in real-time and receive detailed reports on engagement and conversions.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/register"
            className="bg-[#24292F] text-white px-8 py-3 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
          >
            Start Your First Campaign
          </Link>
        </div>
      </main>
    </div>
  );
}