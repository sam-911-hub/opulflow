"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UserInfo {
  uid: string
  email: string
  credits: number
  accountType: string
}

interface OrderInfo {
  id: string
  orderId: string
  status: string
  date: string
}

interface ServiceFormData {
  productName?: string
  platforms?: string[]
  quantity?: number
  tone?: string
  specialInstructions?: string
  targetKeywords?: string
  niche?: string
  platformPreference?: string
  numInfluencers?: number
  budgetRange?: string
  platform?: string
  ratingPreference?: string
  keyPoints?: string
  file?: File
  wordCount?: number
  deadline?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [orders, setOrders] = useState<OrderInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeService, setActiveService] = useState<string | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>({})
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch("/api/user")
        if (!userRes.ok) {
          router.push("/login")
          return
        }
        const userData = await userRes.json()
        setUser(userData.user)

        const ordersRes = await fetch("/api/orders")
        if (ordersRes.ok) {
          const odata = await ordersRes.json()
          setOrders(odata.orders || [])
        }
      } catch (e) {
        console.error("Error", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  const calculateCost = (service: string, data: ServiceFormData) => {
    switch (service) {
      case 'comment':
        const quantity = data.quantity || 0
        // Bulk discount: 10% off for 50+, 20% off for 100+
        if (quantity >= 100) return quantity * 0.30 * 0.8
        if (quantity >= 50) return quantity * 0.30 * 0.9
        return quantity * 0.30
      case 'search':
        return 5.00
      case 'influencer':
        return (data.numInfluencers || 0) * 0.30
      case 'review':
        return 1.00
      case 'humanization':
        return (data.wordCount || 0) * 0.015
      default:
        return 0
    }
  }

  const handleSubmit = async (service: string) => {
    // Basic validation
    if (!formData.productName && service !== 'search') {
      alert('Please fill in all required fields')
      return
    }

    const cost = calculateCost(service, formData)
    if (cost === 0) {
      alert('Invalid order details')
      return
    }

    // Create order summary
    const orderData = {
      service,
      userEmail: user?.email,
      formData,
      totalCost: cost,
      timestamp: new Date().toISOString()
    }

    // Store in localStorage for payment page
    localStorage.setItem('pendingOrder', JSON.stringify(orderData))

    // Redirect to payment
    router.push('/dashboard/payment')
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#656d76] text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#24292F]">Dashboard</h1>
          <p className="text-[#656d76] mt-1">Welcome back, {user?.email}</p>
        </div>
        <Link href="/" className="text-[#0969DA] hover:text-[#0757c2] text-sm">
          ← Back to Homepage
        </Link>
      </div>

      {/* Credits Metric Card */}
      <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-[#656d76] uppercase tracking-wide">Available Credits</h2>
            <p className="text-3xl font-bold text-[#24292F] mt-2">{user?.credits || 0}</p>
            <p className="text-xs text-[#656d76] mt-1">Credits are used for comment writing only</p>
          </div>
          <Link
            href="/dashboard/buy-credits"
            className="bg-[#0969DA] text-white px-4 py-2 rounded-md hover:bg-[#0757c2] transition-colors font-medium"
          >
            Buy Credits
          </Link>
        </div>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Comment Writing */}
        <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#0969DA] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#24292F]">Comment Writing</h3>
              <p className="text-sm text-[#656d76]">$0.30 per comment (bulk discounts available)</p>
            </div>
          </div>

          {activeService === 'comment' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-1">Product Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                  onChange={(e) => updateFormData('productName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-2">Platforms *</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Twitter', 'Reddit', 'LinkedIn', 'Instagram', 'Facebook', 'TikTok', 'Quora'].map(platform => (
                    <label key={platform} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        onChange={(e) => {
                          const current = formData.platforms || []
                          if (e.target.checked) {
                            updateFormData('platforms', [...current, platform])
                          } else {
                            updateFormData('platforms', current.filter(p => p !== platform))
                          }
                        }}
                      />
                      <span className="text-sm text-[#656d76]">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-1">Quantity (1-100) *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                  onChange={(e) => updateFormData('quantity', parseInt(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-1">Tone</label>
                <select
                  className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                  onChange={(e) => updateFormData('tone', e.target.value)}
                >
                  <option value="">Select tone</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="helpful">Helpful</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-1">Special Instructions</label>
                <textarea
                  className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                  rows={3}
                  onChange={(e) => updateFormData('specialInstructions', e.target.value)}
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleSubmit('comment')}
                  className="bg-[#24292F] text-white px-4 py-2 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setActiveService(null)}
                  className="border border-[#d1d9e0] text-[#24292F] px-4 py-2 rounded-md hover:bg-[#f6f8fa] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setActiveService('comment')}
              className="w-full bg-[#24292F] text-white py-2 px-4 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
            >
              Submit Request
            </button>
          )}
        </div>

        {/* Manual Product Search */}
        <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#0969DA] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#24292F]">Manual Product Search</h3>
              <p className="text-sm text-[#656d76]">$5.00 per search</p>
            </div>
          </div>

          {activeService === 'search' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-1">Product Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                  onChange={(e) => updateFormData('productName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-1">Target Keywords (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., best, reviews, alternatives"
                  className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                  onChange={(e) => updateFormData('targetKeywords', e.target.value)}
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleSubmit('search')}
                  className="bg-[#24292F] text-white px-4 py-2 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setActiveService(null)}
                  className="border border-[#d1d9e0] text-[#24292F] px-4 py-2 rounded-md hover:bg-[#f6f8fa] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setActiveService('search')}
              className="w-full bg-[#24292F] text-white py-2 px-4 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
            >
              Submit Request
            </button>
          )}
        </div>

        {/* Influencer Research */}
        <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#0969DA] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#24292F]">Influencer Research</h3>
              <p className="text-sm text-[#656d76]">$0.30 per influencer profile</p>
            </div>
          </div>

          {activeService === 'influencer' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-1">Niche *</label>
                <input
                  type="text"
                  placeholder="e.g., fitness, SaaS, beauty, gaming"
                  className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                  onChange={(e) => updateFormData('niche', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-1">Platform Preference</label>
                <select
                  className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                  onChange={(e) => updateFormData('platformPreference', e.target.value)}
                >
                  <option value="">Any platform</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Twitter">Twitter</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-1">Number of Influencers (1-50) *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                  onChange={(e) => updateFormData('numInfluencers', parseInt(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-1">Budget Range (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., $500-$2000 per post"
                  className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                  onChange={(e) => updateFormData('budgetRange', e.target.value)}
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleSubmit('influencer')}
                  className="bg-[#24292F] text-white px-4 py-2 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setActiveService(null)}
                  className="border border-[#d1d9e0] text-[#24292F] px-4 py-2 rounded-md hover:bg-[#f6f8fa] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setActiveService('influencer')}
              className="w-full bg-[#24292F] text-white py-2 px-4 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
            >
              Submit Request
            </button>
          )}
        </div>

        {/* Product Reviews */}
        <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#0969DA] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#24292F]">Product Reviews</h3>
              <p className="text-sm text-[#656d76]">$1.00 per review</p>
            </div>
          </div>

          {activeService === 'review' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-1">Product Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                  onChange={(e) => updateFormData('productName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-1">Platform *</label>
                <select
                  className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                  onChange={(e) => updateFormData('platform', e.target.value)}
                >
                  <option value="">Select platform</option>
                  <option value="App Store">App Store</option>
                  <option value="Google Play">Google Play</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Goodreads">Goodreads</option>
                  <option value="Product Hunt">Product Hunt</option>
                  <option value="Capterra">Capterra</option>
                  <option value="Trustpilot">Trustpilot</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-1">Rating Preference *</label>
                <select
                  className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                  onChange={(e) => updateFormData('ratingPreference', e.target.value)}
                >
                  <option value="">Select preference</option>
                  <option value="5-star focused">5-star focused</option>
                  <option value="authentic honest">Authentic honest</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-1">Key Points to Mention</label>
                <textarea
                  placeholder="Specific features or benefits to highlight in the review"
                  className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                  rows={3}
                  onChange={(e) => updateFormData('keyPoints', e.target.value)}
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleSubmit('review')}
                  className="bg-[#24292F] text-white px-4 py-2 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setActiveService(null)}
                  className="border border-[#d1d9e0] text-[#24292F] px-4 py-2 rounded-md hover:bg-[#f6f8fa] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setActiveService('review')}
              className="w-full bg-[#24292F] text-white py-2 px-4 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
            >
              Submit Request
            </button>
          )}
        </div>

        {/* AI Content Humanization */}
        <div className="bg-white border border-[#d1d9e0] rounded-lg p-6 lg:col-span-2">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#0969DA] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#24292F]">AI Content Humanization</h3>
              <p className="text-sm text-[#656d76]">$0.015 per word</p>
            </div>
          </div>

          {activeService === 'humanization' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#24292F] mb-1">Upload AI Content *</label>
                <input
                  type="file"
                  accept=".txt,.docx,.pdf"
                  className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                  onChange={(e) => updateFormData('file', e.target.files?.[0])}
                />
                <p className="text-xs text-[#656d76] mt-1">Supported formats: .txt, .docx, .pdf</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#24292F] mb-1">Word Count *</label>
                  <input
                    type="number"
                    placeholder="Enter word count"
                    className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                    onChange={(e) => updateFormData('wordCount', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#24292F] mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-[#d1d9e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969DA]"
                    onChange={(e) => updateFormData('deadline', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleSubmit('humanization')}
                  className="bg-[#24292F] text-white px-4 py-2 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setActiveService(null)}
                  className="border border-[#d1d9e0] text-[#24292F] px-4 py-2 rounded-md hover:bg-[#f6f8fa] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setActiveService('humanization')}
              className="w-full bg-[#24292F] text-white py-2 px-4 rounded-md hover:bg-[#1b1f23] transition-colors font-medium"
            >
              Submit Request
            </button>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-[#d1d9e0] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[#24292F] mb-4">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-[#656d76] text-center py-8">No orders yet. Start your first campaign!</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border border-[#d1d9e0] rounded-md hover:bg-[#f6f8fa] transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#0969DA] rounded-md flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="font-medium text-[#0969DA] hover:text-[#0757c2]"
                    >
                      {order.orderId}
                    </Link>
                    <p className="text-sm text-[#656d76]">{order.date}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === "completed" ? "bg-[#dcfce7] text-[#166534]" :
                  order.status === "pending" ? "bg-[#fef3c7] text-[#92400e]" :
                  "bg-[#f3f4f6] text-[#374151]"
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
        {orders.length > 0 && (
          <div className="text-center mt-4">
            <Link
              href="/dashboard/orders"
              className="text-[#0969DA] hover:text-[#0757c2] font-medium"
            >
              View all orders →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}