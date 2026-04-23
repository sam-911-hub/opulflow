import Link from "next/link";

export default function BlogPage() {
  const blogPosts = [
    {
      title: "The Future of Sales Outreach: Human-AI Collaboration",
      excerpt: "How combining human intelligence with AI technology is revolutionizing lead generation and sales outreach strategies.",
      date: "2024-01-15",
      readTime: "5 min read"
    },
    {
      title: "Why Personalized Outreach Still Matters in 2024",
      excerpt: "Despite automation trends, personalized human outreach continues to deliver superior results for B2B sales teams.",
      date: "2024-01-10",
      readTime: "4 min read"
    },
    {
      title: "Building Trust Through Authentic Sales Conversations",
      excerpt: "Learn how genuine human connections can build lasting trust and drive long-term customer relationships.",
      date: "2024-01-05",
      readTime: "6 min read"
    }
  ];

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
              <Link href="/blog" className="text-[#0969DA] font-medium">
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

      {/* Blog Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#24292F] mb-4">OpulFlow Blog</h1>
          <p className="text-xl text-[#656d76] max-w-2xl mx-auto">
            Insights, strategies, and best practices for modern sales and lead generation.
          </p>
        </div>

        <div className="space-y-8">
          {blogPosts.map((post, index) => (
            <article key={index} className="bg-white border border-[#d1d9e0] rounded-lg p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center text-sm text-[#656d76] mb-3">
                <span>{post.date}</span>
                <span className="mx-2">•</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="text-2xl font-semibold text-[#24292F] mb-3 hover:text-[#0969DA] transition-colors cursor-pointer">
                {post.title}
              </h2>
              <p className="text-[#656d76] mb-4">
                {post.excerpt}
              </p>
              <Link
                href="#"
                className="text-[#0969DA] hover:text-[#0757c2] font-medium"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-[#656d76] mb-4">Want more insights? Subscribe to our newsletter.</p>
          <Link
            href="/register"
            className="bg-[#24292F] text-white px-8 py-3 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}