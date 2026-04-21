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
            Coming Soon
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">OpulFlow</h3>
            <p className="text-gray-400">© {new Date().getFullYear()} OpulFlow Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}