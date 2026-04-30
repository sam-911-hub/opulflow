import Link from "next/link";

export const dynamic = 'force-dynamic';

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "OpulFlow",
  "url": "https://opulflow.top",
  "description": "Professional Social Media Marketing Services",
  "logo": "https://opulflow.top/favicon.svg",
  "sameAs": [
    "https://www.facebook.com/share/1GpPhrtVS9/",
    "https://x.com/opulflow_inc",
    "https://www.linkedin.com/company/opulflow/",
    "https://www.instagram.com/opulflow_inc?igsh=MXZsbmdwOGZuY2Zyeg==",
    "https://www.tiktok.com/@opulflow_inc?_r=1&_t=ZS-95xx7QnSbY8"
  ]
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
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
          We whisper your product in the right ears
        </h1>
        <p className="text-xl text-[#656d76] mb-8 max-w-2xl mx-auto">
          Boost your online presence with expert comment writing, influencer outreach, product reviews, and AI content humanization. Trusted by businesses worldwide for genuine social media engagement.
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

        {/* Supported Platforms Strip */}
        <div className="mt-16 mb-8">
          <div className="text-center mb-6">
            <h3 className="text-sm font-medium text-[#656d76] uppercase tracking-wide">
              We engage on 25+ platforms
            </h3>
          </div>

          <div className="border-t border-b border-[#d1d9e0] py-8">
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-13 gap-4 justify-items-center max-w-6xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#1DA1F2] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">𝕏</span>
                </div>
                <span className="text-xs text-[#848d97]">Twitter</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">R</span>
                </div>
                <span className="text-xs text-[#848d97]">Reddit</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#0077B5] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">in</span>
                </div>
                <span className="text-xs text-[#848d97]">LinkedIn</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">📷</span>
                </div>
                <span className="text-xs text-[#848d97]">Instagram</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#1877F2] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                <span className="text-xs text-[#848d97]">Facebook</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">TT</span>
                </div>
                <span className="text-xs text-[#848d97]">TikTok</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#B92B27] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">Q</span>
                </div>
                <span className="text-xs text-[#848d97]">Quora</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#FF0000] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">▶</span>
                </div>
                <span className="text-xs text-[#848d97]">YouTube</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#5865F2] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">💬</span>
                </div>
                <span className="text-xs text-[#848d97]">Discord</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#4A154B] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <span className="text-xs text-[#848d97]">Slack</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#0088CC] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">✈</span>
                </div>
                <span className="text-xs text-[#848d97]">Telegram</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#25D366] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">📱</span>
                </div>
                <span className="text-xs text-[#848d97]">WhatsApp</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#E60023] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">📌</span>
                </div>
                <span className="text-xs text-[#848d97]">Pinterest</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#FFFC00] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs">👻</span>
                </div>
                <span className="text-xs text-[#848d97]">Snapchat</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#36465D] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
                <span className="text-xs text-[#848d97]">Tumblr</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <span className="text-xs text-[#848d97]">Medium</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#FF6600] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">HN</span>
                </div>
                <span className="text-xs text-[#848d97]">Hacker News</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#DA552F] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">PH</span>
                </div>
                <span className="text-xs text-[#848d97]">Product Hunt</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#FF6B35] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">IH</span>
                </div>
                <span className="text-xs text-[#848d97]">Indie Hackers</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">GH</span>
                </div>
                <span className="text-xs text-[#848d97]">GitHub</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#F48024] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">SO</span>
                </div>
                <span className="text-xs text-[#848d97]">Stack Overflow</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#6364FF] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <span className="text-xs text-[#848d97]">Mastodon</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs">@</span>
                </div>
                <span className="text-xs text-[#848d97]">Threads</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#0085FF] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">B</span>
                </div>
                <span className="text-xs text-[#848d97]">Bluesky</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-[#9146FF] rounded-md flex items-center justify-center mb-1">
                  <span className="text-white text-xs font-bold">TV</span>
                </div>
                <span className="text-xs text-[#848d97]">Twitch</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-[#848d97]">human engagement</p>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}