import Link from "next/link";

export default function Home() {
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

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#24292F] mb-6">
          We Whisper Your Product In The Right Ears
        </h1>
        <p className="text-xl text-[#656d76] mb-8 max-w-2xl mx-auto">
          Human-powered lead discovery platform that connects your product with the perfect audience through personalized outreach and genuine engagement.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="bg-[#24292F] text-white px-8 py-3 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="border border-[#d1d9e0] text-[#24292F] px-8 py-3 rounded-md hover:bg-[#f6f8fa] transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}