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
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#24292F] mb-4">OpulFlow Services</h1>
          <p className="text-xl text-[#656d76] max-w-3xl mx-auto">
            OpulFlow offers five core human-powered services. All services are performed entirely by real humans for every comment, search, influencer list, review, and content rewrite.
          </p>
        </div>

        <div className="space-y-8 mb-12">
          <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[#0969DA] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-[#24292F] mb-2">Comment Writing</h2>
                <p className="text-[#656d76] mb-4">
                  Users purchase credits and real humans post authentic, context-aware comments on social media platforms (Twitter, Reddit, LinkedIn, Instagram, Facebook, TikTok, Quora) to drive engagement and traffic.
                </p>
                <div className="bg-[#f6f8fa] p-4 rounded-md">
                  <p className="text-sm text-[#656d76]">
                    <strong>How it works:</strong> You purchase credits, then submit an order telling us your product name, which social media platforms to target, how many comments you want, and the tone you prefer. We manually find relevant conversations where people are asking for recommendations or solutions, then write and post authentic, helpful comments promoting your brand. We take screenshots of every comment and deliver them to your dashboard and email.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[#0969DA] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-[#24292F] mb-2">Manual Product Search</h2>
                <p className="text-[#656d76] mb-4">
                  We manually search social media to provide an estimated count of how many people are asking about or seeking recommendations for a specific product.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-green-800 font-medium">🎉 This service is completely FREE!</p>
                </div>
                <div className="bg-[#f6f8fa] p-4 rounded-md">
                  <p className="text-sm text-[#656d76]">
                    <strong>How it works:</strong> You enter your product name into the search tool. We manually search across social media platforms to find and count how many people are actively asking about or seeking recommendations for a product like yours. We give you an estimated number (with a note that actual numbers may be higher) displayed in your dashboard—no links or specific post details, just the demand estimate to help you decide if you want to engage.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[#0969DA] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-[#24292F] mb-2">Influencer Research</h2>
                <p className="text-[#656d76] mb-4">
                  We manually find and deliver a curated list of relevant micro-influencers in any niche, including their social media links, follower counts, and contact information.
                </p>
                <div className="bg-[#f6f8fa] p-4 rounded-md">
                  <p className="text-sm text-[#656d76]">
                    <strong>How it works:</strong> You tell us your niche (e.g., fitness, SaaS, beauty, gaming), preferred platforms, and how many influencer profiles you need. We manually research and compile a list of relevant micro-influencers, including their names, social media handles, profile URLs, follower counts, engagement estimates, and contact information where available. We deliver the list to your dashboard and email as a PDF or CSV file.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[#0969DA] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-[#24292F] mb-2">Product Reviews</h2>
                <p className="text-[#656d76] mb-4">
                  We write authentic, human-generated reviews for websites, mobile apps, books, software, e-commerce products, or any digital or physical item, posted on platforms like the App Store, Google Play, Amazon, Goodreads, Product Hunt, Capterra, or Trustpilot.
                </p>
                <div className="bg-[#f6f8fa] p-4 rounded-md">
                  <p className="text-sm text-[#656d76]">
                    <strong>How it works:</strong> You tell us what needs reviews (your app, book, website, or product), which platform (App Store, Google Play, Amazon, Goodreads, Product Hunt, Capterra, or Trustpilot), and your preferred rating (5-star focused or authentic honest). We write thoughtful, human-generated reviews based on your product's actual features and benefits, post them to the platform, and send you screenshot proof of every review.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[#0969DA] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-[#24292F] mb-2">AI Content Humanization</h2>
                <p className="text-[#656d76] mb-4">
                  We take AI-generated text (from ChatGPT, Jasper, Claude, or any AI tool) and rewrite it to sound natural, engaging, and genuinely human, with pricing at $0.015 per word.
                </p>
                <div className="bg-[#f6f8fa] p-4 rounded-md">
                  <p className="text-sm text-[#656d76]">
                    <strong>How it works:</strong> You upload your AI-generated document (blog post, email, social caption, essay, or article) and tell us the word count and your deadline. We have a real human rewrite the content to sound natural, conversational, and genuinely human—removing robotic phrasing, awkward transitions, and detectable AI patterns while keeping your original message and key points intact. We deliver the humanized version to your email and dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="bg-[#24292F] text-white px-8 py-3 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
          >
            Start Using OpulFlow
          </Link>
        </div>
      </main>
    </div>
  );
}