'use client'

import Link from "next/link";

const blogPosts = [
  {
    title: "How to Buy Social Media Comments Effectively in 2026",
    slug: "how-to-buy-social-media-comments-2026",
    excerpt: "Learn the best practices for purchasing authentic social media comments that boost engagement and credibility.",
    date: "2026-04-30",
    readTime: "5 min read",
    category: "Social Media Marketing",
    keywords: ["buy social media comments", "authentic engagement", "social media growth"]
  },
  {
    title: "The Ultimate Guide to Influencer Research and Outreach",
    slug: "influencer-research-outreach-guide",
    excerpt: "Discover how to find the perfect influencers for your brand and build successful partnerships.",
    date: "2026-04-25",
    readTime: "8 min read",
    category: "Influencer Marketing",
    keywords: ["influencer research", "influencer outreach", "brand partnerships"]
  },
  {
    title: "Why Product Reviews Matter for Your Online Reputation",
    slug: "product-reviews-online-reputation",
    excerpt: "Explore the impact of genuine product reviews on consumer trust and business success.",
    date: "2026-04-20",
    readTime: "6 min read",
    category: "Reputation Management",
    keywords: ["product reviews", "online reputation", "consumer trust"]
  },
  {
    title: "AI Content Humanization: Making Your Content More Engaging",
    slug: "ai-content-humanization-guide",
    excerpt: "Transform AI-generated content into natural, compelling copy that resonates with readers.",
    date: "2026-04-15",
    readTime: "7 min read",
    category: "Content Marketing",
    keywords: ["AI humanization", "content creation", "engaging copy"]
  },
  {
    title: "Top Social Media Platforms for Business Growth in 2026",
    slug: "top-social-media-platforms-2026",
    excerpt: "Stay ahead of the curve with the most effective social media platforms for business growth.",
    date: "2026-04-10",
    readTime: "6 min read",
    category: "Platform Strategy",
    keywords: ["social media platforms", "business growth", "digital marketing"]
  },
  {
    title: "Building Authentic Social Media Engagement: Best Practices",
    slug: "authentic-social-media-engagement",
    excerpt: "Learn how to foster genuine interactions and build a loyal community on social media.",
    date: "2026-04-05",
    readTime: "5 min read",
    category: "Community Building",
    keywords: ["social media engagement", "authentic marketing", "community building"]
  }
];

export default function BlogPage() {
  return (
    <>
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
                <Link href="/services" className="text-[#24292F] hover:text-[#0969DA] transition-colors">
                  Services
                </Link>
                <Link href="/blog" className="text-[#24292F] hover:text-[#0969DA] transition-colors font-medium">
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
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#24292F] mb-6">
            OpulFlow Blog
          </h1>
          <p className="text-xl text-[#656d76] mb-8 max-w-2xl mx-auto">
            Expert insights, tips, and strategies for social media marketing, influencer outreach, and online reputation management.
          </p>
        </section>

        {/* Blog Posts Grid */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article key={index} className="bg-white rounded-lg shadow-sm border border-[#d1d9e0] p-6">
                <div className="mb-4">
                  <span className="inline-block bg-[#0969DA] text-white text-xs px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#24292F] mb-3 hover:text-[#0969DA] transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="text-[#656d76] mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-[#848d97]">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-[#0969DA] hover:text-[#24292F] transition-colors font-medium"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="bg-white border-t border-[#d1d9e0]">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-bold text-[#24292F] mb-4">Stay Updated</h2>
            <p className="text-xl text-[#656d76] mb-8">
              Get the latest social media marketing tips and strategies delivered to your inbox.
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-[#d1d9e0] rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#0969DA] focus:border-[#0969DA]"
                />
                <button className="bg-[#24292F] text-white px-6 py-3 rounded-r-md hover:bg-[#1b1f23] transition-colors font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}