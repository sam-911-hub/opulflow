import Link from "next/link";

export const dynamic = 'force-dynamic';

const services = [
  {
    title: "Comment Writing Service",
    slug: "comment-writing",
    description: "Generate authentic, engaging comments for your social media posts across all major platforms.",
    features: [
      "Human-written comments that sound natural",
      "Platform-specific tone and style",
      "Bulk comment packages available",
      "Fast delivery within 24 hours",
      "25+ supported platforms"
    ],
    keywords: ["buy social media comments", "comment writing service", "authentic comments"],
    price: "Starting at $0.30 per comment"
  },
  {
    title: "Influencer Research & Outreach",
    slug: "influencer-research",
    description: "Find and connect with the perfect influencers for your brand and niche.",
    features: [
      "Detailed influencer profiles with analytics",
      "Audience demographics and engagement rates",
      "Contact information and outreach templates",
      "Niche-specific recommendations",
      "Competitor analysis included"
    ],
    keywords: ["influencer marketing", "influencer outreach", "find influencers"],
    price: "Starting at $0.30 per influencer"
  },
  {
    title: "Product Review Writing",
    slug: "product-reviews",
    description: "Create genuine, persuasive product reviews for marketplaces and review sites.",
    features: [
      "Platform-optimized review formats",
      "Star rating strategies",
      "SEO-friendly content",
      "Bulk review packages",
      "Custom review templates"
    ],
    keywords: ["product reviews", "review writing service", "marketplace reviews"],
    price: "Starting at $1.00 per review"
  },
  {
    title: "AI Content Humanization",
    slug: "ai-content-humanization",
    description: "Transform AI-generated content into natural, engaging text that resonates with readers.",
    features: [
      "Advanced AI detection avoidance",
      "Natural language processing",
      "Tone and style customization",
      "Plagiarism-free guarantee",
      "Unlimited revisions"
    ],
    keywords: ["AI content humanization", "AI text improvement", "natural content writing"],
    price: "$0.015 per word"
  }
];

export default function ServicesPage() {
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
                <Link href="/services" className="text-[#24292F] hover:text-[#0969DA] transition-colors font-medium">
                  Services
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
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#24292F] mb-6">
            Professional Social Media Marketing Services
          </h1>
          <p className="text-xl text-[#656d76] mb-8 max-w-2xl mx-auto">
            Boost your online presence with our comprehensive suite of social media marketing services.
            From authentic comments to influencer partnerships, we help you connect with your audience.
          </p>
          <Link
            href="/register"
            className="bg-[#24292F] text-white px-8 py-3 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
          >
            Get Started Today
          </Link>
        </section>

        {/* Services Grid */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-[#d1d9e0] p-6">
                <h2 className="text-2xl font-bold text-[#24292F] mb-4">{service.title}</h2>
                <p className="text-[#656d76] mb-6">{service.description}</p>

                <div className="mb-6">
                  <h3 className="font-semibold text-[#24292F] mb-3">Key Features:</h3>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-[#656d76]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <span className="text-2xl font-bold text-[#24292F]">{service.price}</span>
                </div>

                <Link
                  href={`/services/${service.slug}`}
                  className="inline-block bg-[#24292F] text-white px-6 py-2 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
                >
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white border-t border-[#d1d9e0]">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-bold text-[#24292F] mb-8">Why Choose OpulFlow?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-[#24292F] mb-4">Human-Powered Quality</h3>
                <p className="text-[#656d76]">All our services are performed by real humans, ensuring authentic engagement that algorithms can't detect.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#24292F] mb-4">25+ Platforms Supported</h3>
                <p className="text-[#656d76]">From Twitter and Reddit to LinkedIn and Instagram, we cover all major social media platforms.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#24292F] mb-4">Fast & Reliable</h3>
                <p className="text-[#656d76]">Quick turnaround times and reliable delivery ensure your social media presence grows rapidly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-[#24292F] mb-6">Ready to Boost Your Social Media Presence?</h2>
          <p className="text-xl text-[#656d76] mb-8">
            Join thousands of businesses using OpulFlow to enhance their online reputation and engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-[#24292F] text-white px-8 py-3 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
            >
              Start Your Free Trial
            </Link>
            <Link
              href="/contact"
              className="border border-[#d1d9e0] text-[#24292F] px-8 py-3 rounded-md hover:bg-[#f6f8fa] transition-colors font-medium"
            >
              Contact Sales
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}