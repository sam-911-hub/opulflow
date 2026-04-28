import Link from "next/link";

export default function PricingPage() {
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
              <p className="text-sm text-slate-500">Modern human-powered engagement services</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-medium">
            <Link href="/pricing" className="rounded-full bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 transition">Pricing</Link>
            <Link href="/product" className="rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100 transition">Product</Link>
            <Link href="/blog" className="rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100 transition">Blog</Link>
            <Link href="/how-it-works" className="rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100 transition">How it works</Link>
            <Link href="/login" className="rounded-full px-4 py-2 text-slate-700 hover:bg-slate-100 transition">Log in</Link>
            <Link href="/register" className="rounded-full border border-slate-200 px-4 py-2 text-slate-900 hover:bg-slate-100 transition">Sign up</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <section className="rounded-[2rem] bg-white p-10 shadow-xl border border-slate-200 mb-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-semibold mb-4">Transparent pricing</p>
              <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">Simple pricing that scales with your growth</h1>
              <p className="mt-6 text-lg text-slate-600 max-w-2xl">
                Pay only for real human-powered services. No surprise fees, no subscriptions, just clear credit-based pricing for every comment, review, search, and influencer order.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-white font-semibold shadow-lg hover:bg-blue-700 transition">
                  Start free
                </Link>
                <Link href="/product" className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-slate-700 hover:bg-slate-100 transition">
                  Learn more
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-blue-50 p-6">
                <p className="text-sm text-blue-700">Best for fast engagement</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">$0.30</p>
                <p className="mt-1 text-slate-600">per comment</p>
              </div>
              <div className="rounded-3xl bg-emerald-50 p-6">
                <p className="text-sm text-emerald-700">Always free</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">FREE</p>
                <p className="mt-1 text-slate-600">product search</p>
              </div>
              <div className="rounded-3xl bg-purple-50 p-6">
                <p className="text-sm text-purple-700">Human review service</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">$1.00</p>
                <p className="mt-1 text-slate-600">per review</p>
              </div>
              <div className="rounded-3xl bg-pink-50 p-6">
                <p className="text-sm text-pink-700">Content humanization</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">$0.015</p>
                <p className="mt-1 text-slate-600">per word</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3 mb-12">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Flexible usage</h2>
            <p className="text-slate-600 mb-6">Use credits when you need them and never pay for inactivity.</p>
            <ul className="space-y-3 text-slate-600">
              <li>• No subscription fees</li>
              <li>• Buy credits anytime</li>
              <li>• Use any service with the same balance</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Clear service rates</h2>
            <p className="text-slate-600 mb-6">Every service is priced clearly so you can estimate costs before ordering.</p>
            <ul className="space-y-3 text-slate-600">
              <li>• Comment writing: $0.30 each</li>
              <li>• Product research: FREE</li>
              <li>• Influencer lists: $0.30 each</li>
              <li>• Reviews: $1.00 each</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Transparent credits</h2>
            <p className="text-slate-600 mb-6">Credits never expire and balance updates instantly in your dashboard.</p>
            <ul className="space-y-3 text-slate-600">
              <li>• Real-time credit balance</li>
              <li>• No hidden fees</li>
              <li>• Easy top-ups</li>
            </ul>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-10 shadow-xl border border-slate-200">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-semibold mb-4">Example costs</p>
              <div className="space-y-4 text-slate-600">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="font-semibold text-slate-900">10 comments</p>
                  <p>$3.00</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="font-semibold text-slate-900">Product search</p>
                  <p>FREE</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="font-semibold text-slate-900">5 reviews</p>
                  <p>$5.00</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-blue-600 p-8 text-white">
              <h3 className="text-2xl font-semibold mb-4">Start smarter today</h3>
              <p className="text-slate-100 mb-6">Create an account, top up credits, and launch your first campaign with confidence.</p>
              <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-slate-100 transition">
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
