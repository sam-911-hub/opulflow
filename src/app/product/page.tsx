import Link from "next/link";

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg">
              OP
            </div>
            <div>
              <Link href="/" className="text-xl font-semibold text-slate-900">OpulFlow</Link>
              <p className="text-sm text-slate-500">Human-powered services for digital growth</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-medium">
            <Link href="/pricing" className="rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100 transition">Pricing</Link>
            <Link href="/product" className="rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition">Product</Link>
            <Link href="/blog" className="rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100 transition">Blog</Link>
            <Link href="/how-it-works" className="rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100 transition">How it works</Link>
            <Link href="/login" className="rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100 transition">Log in</Link>
            <Link href="/register" className="rounded-full border border-slate-200 px-4 py-2 text-slate-900 hover:bg-slate-100 transition">Sign up</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <section className="rounded-[2rem] bg-white p-10 shadow-xl border border-slate-200 mb-12">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-semibold mb-4">What we do</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Five human-powered services that deliver real results</h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              OpulFlow connects your brand with authentic conversations, product insights, influencer outreach, reviews, and humanized content—every service supported by skilled operators and delivered with transparency.
            </p>
          </div>
        </section>

        <section className="grid gap-6 mb-12">
          <div className="rounded-[2rem] bg-white border border-slate-200 shadow-xl p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white text-2xl font-bold">
                C
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-3">Comment Writing</h2>
                <p className="text-slate-600 mb-4">
                  Real humans post context-aware, audience-focused comments across social networks like Twitter, Reddit, LinkedIn, Instagram, Facebook, TikTok, and Quora to drive engagement and increase brand visibility.
                </p>
                <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                  <p className="text-slate-600 text-sm">
                    Orders include target platform guidance, tone selection, keyword direction, and screenshot proof of every published comment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white border border-slate-200 shadow-xl p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-600 text-white text-2xl font-bold">
                S
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-3">Manual Product Search</h2>
                <p className="text-slate-600 mb-4">
                  We manually research your product’s demand across social platforms and estimate how many users are actively asking for recommendations or searching for similar offerings.
                </p>
                <div className="rounded-3xl bg-emerald-50 p-5 border border-emerald-100">
                  <p className="text-emerald-700 text-sm">
                    This service is free and ideal for validating demand before investing in ads or organic outreach.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white border border-slate-200 shadow-xl p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-600 text-white text-2xl font-bold">
                I
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-3">Influencer Research</h2>
                <p className="text-slate-600 mb-4">
                  We deliver curated influencer lists with platform handles, follower counts, engagement estimates, and contact details so you can reach the right creators faster.
                </p>
                <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                  <p className="text-slate-600 text-sm">
                    Every list is manually verified, niche-specific, and designed for outreach campaigns that drive attention and conversions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white border border-slate-200 shadow-xl p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-pink-600 text-white text-2xl font-bold">
                R
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-3">Product Reviews</h2>
                <p className="text-slate-600 mb-4">
                  Human-generated reviews for apps, products, books, SaaS, and marketplaces help showcase value and build credibility on the platforms your customers trust.
                </p>
                <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                  <p className="text-slate-600 text-sm">
                    Reviews are crafted with authentic product details, relevant benefits, and platform-safe language for Amazon, App Store, Google Play, Product Hunt, and more.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white border border-slate-200 shadow-xl p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-600 text-white text-2xl font-bold">
                H
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-3">AI Content Humanization</h2>
                <p className="text-slate-600 mb-4">
                  We rewrite AI-generated content to sound natural, relatable, and polished while retaining your core message and brand voice.
                </p>
                <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                  <p className="text-slate-600 text-sm">
                    Ideal for emails, social captions, blogs, and landing page copy when you need a human edge on AI output.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex rounded-full bg-blue-600 px-8 py-3 text-white font-semibold shadow-lg hover:bg-blue-700 transition"
          >
            Start Using OpulFlow
          </Link>
        </div>
      </main>
    </div>
  );
}
