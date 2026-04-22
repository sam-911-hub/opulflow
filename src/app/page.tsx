import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 to-orange-800">
      <div className="bg-gradient-to-br from-orange-700 to-orange-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to OpulFlow</h1>
          <p className="text-xl mb-3">Next-gen sales intelligence platform for modern teams</p>
          <p className="text-lg font-medium mb-8">Human-powered engagement for real growth</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login" className="bg-white text-orange-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-100">
              Login
            </Link>
            <Link href="/register" className="bg-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-700">
              Get Started
            </Link>
          </div>
        </div>
      </div>
      <footer className="bg-gray-900 text-white pt-12 pb-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} OpulFlow Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}