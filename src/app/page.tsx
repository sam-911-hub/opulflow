import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 to-orange-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-700 to-orange-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to OpulFlow
          </h1>
          <p className="text-xl mb-3">
            Next-gen sales intelligence platform for modern teams
          </p>
          <p className="text-lg font-medium mb-8">
            Only pay for what you use - No subscriptions, no lock-in
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/pricing"
              className="bg-white text-orange-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              View Pricing
            </Link>
            <Link
              href="/help"
              className="bg-orange-600 text-white px-8 py-3 rounded-lg font-medium border border-orange-500 hover:bg-orange-700 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-orange-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 p-2 rounded-full text-orange-600 text-xl">👥</div>
                <h3 className="text-xl font-semibold text-gray-900">Sales Intelligence</h3>
              </div>
              <p className="text-gray-800 mb-4">Lead lookup, company enrichment, and email verification</p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-orange-600">From $0.25/lead</p>
                <Link href="/pricing" className="text-orange-600 text-sm hover:underline">Learn more →</Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-orange-600">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 p-2 rounded-full text-orange-700 text-xl">🤖</div>
                <h3 className="text-xl font-semibold text-gray-900">AI-Powered Tools</h3>
              </div>
              <p className="text-gray-800 mb-4">Email generation, call scripts, and sales coaching</p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-orange-700">From $0.10/generation</p>
                <Link href="/pricing" className="text-orange-700 text-sm hover:underline">Learn more →</Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-t-orange-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 p-2 rounded-full text-orange-800 text-xl">⚙️</div>
                <h3 className="text-xl font-semibold text-gray-900">CRM & Automation</h3>
              </div>
              <p className="text-gray-800 mb-4">Mini CRM, workflow automation, and email sequences</p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-orange-800">Bundles from $20</p>
                <Link href="/pricing" className="text-orange-800 text-sm hover:underline">Learn more →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      

      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">How It Works</h2>
          <p className="text-center text-gray-800 mb-12 max-w-3xl mx-auto">
            Simple, transparent, and flexible sales intelligence
          </p>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-orange-200 -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-2xl mb-4 border-4 border-orange-500">
                  💳
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-md w-full">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Purchase Credits</h3>
                  <p className="text-gray-800 text-sm">Buy credits for specific services</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-2xl mb-4 border-4 border-orange-500">
                  🔍
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-md w-full">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Use Services</h3>
                  <p className="text-gray-800 text-sm">Access tools using your credits</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-2xl mb-4 border-4 border-orange-500">
                  📊
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-md w-full">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Track Usage</h3>
                  <p className="text-gray-800 text-sm">Monitor your credit usage</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-2xl mb-4 border-4 border-orange-500">
                  📈
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-md w-full">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Grow Business</h3>
                  <p className="text-gray-800 text-sm">Convert insights into action</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/pricing" className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors">
              View Detailed Pricing
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">OpulFlow</h3>
              <p className="text-gray-400">Next-gen sales intelligence platform with pay-as-you-go pricing</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Features</h4>
              <ul className="space-y-2">
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Sales Intelligence</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">AI Tools</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Workflow Automation</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Analytics</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white">User Manual</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link href="/help" className="text-gray-400 hover:text-white">FAQ</Link></li>
                <li><a href="mailto:support@opulflow.com" className="text-gray-400 hover:text-white">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <p className="text-gray-400 mb-2">Email: <a href="mailto:support@opulflow.com" className="text-orange-400 hover:text-orange-300">support@opulflow.com</a></p>
              <p className="text-gray-400">© {new Date().getFullYear()} OpulFlow Inc. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}