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
  service?: string
  totalCost?: number
  amount?: number
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
  const [activeNav, setActiveNav] = useState('dashboard')
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
        if (quantity >= 100) return quantity * 0.30 * 0.8
        if (quantity >= 50) return quantity * 0.30 * 0.9
        return quantity * 0.30
      case 'search':
        return 0.00
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

    const orderData = {
      service,
      userEmail: user?.email,
      formData,
      totalCost: cost,
      timestamp: new Date().toISOString()
    }

    localStorage.setItem('pendingOrder', JSON.stringify(orderData))
    router.push('/dashboard/payment')
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'comment': return '💬'
      case 'search': return '🔍'
      case 'influencer': return '👥'
      case 'review': return '⭐'
      case 'humanization': return '✨'
      default: return '📝'
    }
  }

  const getServiceName = (service: string) => {
    switch (service) {
      case 'comment': return 'Comment Writing'
      case 'search': return 'Product Search'
      case 'influencer': return 'Influencer Research'
      case 'review': return 'Product Reviews'
      case 'humanization': return 'AI Humanization'
      default: return service
    }
  }

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase()
  }

  const getStats = () => {
    const totalOrders = orders.length
    const completedOrders = orders.filter(o => o.status === 'completed').length
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    return { totalOrders, completedOrders, pendingOrders }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-[#848d97] text-xl">Loading...</div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Header Section - GitHub Style */}
      <div className="border-b border-[#30363d] bg-[#161b22]">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* User Avatar */}
              <div className="w-16 h-16 bg-[#238636] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {getUserInitials(user?.email || '')}
              </div>

              <div>
                <h1 className="text-2xl font-semibold text-[#e6edf3]">Welcome back, {user?.email?.split('@')[0]}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#21262d] text-[#848d97]">
                    🔖 {user?.credits || 0} credits available
                  </span>
                  <span className="text-sm text-[#848d97]">
                    {stats.totalOrders} orders • {stats.completedOrders} completed • {stats.pendingOrders} pending
                  </span>
                </div>
              </div>
            </div>

            <Link href="/" className="text-[#2f81f7] hover:text-[#79c0ff] text-sm">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="px-8 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="w-80 flex-shrink-0">
            {/* Navigation */}
            <nav className="space-y-1 mb-6">
              <Link
                href="/dashboard"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeNav === 'dashboard'
                    ? 'bg-[#21262d] text-[#e6edf3] border-l-2 border-[#2f81f7]'
                    : 'text-[#848d97] hover:text-[#e6edf3] hover:bg-[#21262d]'
                }`}
                onClick={() => setActiveNav('dashboard')}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v2H8V5z" />
                </svg>
                Dashboard
              </Link>

              <Link
                href="/dashboard/orders"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeNav === 'orders'
                    ? 'bg-[#21262d] text-[#e6edf3] border-l-2 border-[#2f81f7]'
                    : 'text-[#848d97] hover:text-[#e6edf3] hover:bg-[#21262d]'
                }`}
                onClick={() => setActiveNav('orders')}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Orders
              </Link>

              <Link
                href="/dashboard/buy-credits"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeNav === 'credits'
                    ? 'bg-[#21262d] text-[#e6edf3] border-l-2 border-[#2f81f7]'
                    : 'text-[#848d97] hover:text-[#e6edf3] hover:bg-[#21262d]'
                }`}
                onClick={() => setActiveNav('credits')}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Buy Credits
              </Link>

              <Link
                href="/dashboard/settings"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeNav === 'settings'
                    ? 'bg-[#21262d] text-[#e6edf3] border-l-2 border-[#2f81f7]'
                    : 'text-[#848d97] hover:text-[#e6edf3] hover:bg-[#21262d]'
                }`}
                onClick={() => setActiveNav('settings')}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
            </nav>

            {/* User Profile Card */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-[#238636] rounded-full flex items-center justify-center text-white font-semibold">
                  {getUserInitials(user?.email || '')}
                </div>
                <div>
                  <div className="font-medium text-[#e6edf3]">{user?.email?.split('@')[0]}</div>
                  <div className="text-xs text-[#848d97]">{user?.email}</div>
                </div>
              </div>
              <div className="space-y-2 text-sm text-[#848d97]">
                <div>Account: {user?.accountType}</div>
                <div>Joined: {new Date().toLocaleDateString()}</div>
                <div className="pt-2 border-t border-[#30363d]">
                  <div className="text-[#e6edf3] font-medium">Quick Stats</div>
                  <div className="text-xs mt-1">
                    {stats.totalOrders} total orders<br />
                    {stats.completedOrders} completed<br />
                    {user?.credits || 0} credits remaining
                  </div>
                </div>
                {/* Admin Access */}
                {user?.email === 'opulflow.inc@gmail.com' && (
                  <div className="pt-2 border-t border-[#30363d]">
                    <Link
                      href="/admin/verify-payments"
                      className="text-[#2f81f7] hover:text-[#79c0ff] text-sm font-medium"
                    >
                      Admin Panel →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="flex-1 space-y-6">
            {/* Recent Activity Feed */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
              <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-[#21262d] transition-colors">
                    <div className="w-8 h-8 bg-[#2f81f7] rounded-full flex items-center justify-center text-white text-sm">
                      {getServiceIcon(order.service || 'default')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-[#e6edf3]">
                          Order <Link href={`/dashboard/orders/${order.id}`} className="text-[#2f81f7] hover:text-[#79c0ff] font-medium">
                            {order.orderId}
                          </Link> {order.status === 'completed' ? 'was delivered' : order.status === 'pending' ? 'is being processed' : 'status updated'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-[#238636] text-white' :
                          order.status === 'pending' ? 'bg-[#bb8009] text-white' :
                          'bg-[#6e7681] text-white'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#848d97] mt-1">
                        {getServiceName(order.service || '')} • ${order.totalCost?.toFixed(2) || '0.00'} • {new Date(order.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-8 text-[#848d97]">
                    <div className="text-4xl mb-2">📝</div>
                    <div>No recent activity</div>
                    <div className="text-sm">Your order history will appear here</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
              <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveService('comment')}
                  className="flex items-center p-3 bg-[#21262d] hover:bg-[#30363d] rounded-md transition-colors border border-[#30363d] text-left"
                >
                  <span className="text-lg mr-3">💬</span>
                  <div>
                    <div className="text-sm font-medium text-[#e6edf3]">Comment Writing</div>
                    <div className="text-xs text-[#848d97]">$0.30 each</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveService('search')}
                  className="flex items-center p-3 bg-[#21262d] hover:bg-[#30363d] rounded-md transition-colors border border-[#30363d] text-left"
                >
                  <span className="text-lg mr-3">🔍</span>
                <div>
                  <div className="text-sm font-medium text-[#e6edf3]">Product Search</div>
                  <div className="text-xs text-[#848d97]">Free</div>
                </div>
                </button>

                <button
                  onClick={() => setActiveService('influencer')}
                  className="flex items-center p-3 bg-[#21262d] hover:bg-[#30363d] rounded-md transition-colors border border-[#30363d] text-left"
                >
                  <span className="text-lg mr-3">👥</span>
                  <div>
                    <div className="text-sm font-medium text-[#e6edf3]">Influencer Research</div>
                    <div className="text-xs text-[#848d97]">$0.30 each</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveService('review')}
                  className="flex items-center p-3 bg-[#21262d] hover:bg-[#30363d] rounded-md transition-colors border border-[#30363d] text-left"
                >
                  <span className="text-lg mr-3">⭐</span>
                  <div>
                    <div className="text-sm font-medium text-[#e6edf3]">Product Reviews</div>
                    <div className="text-xs text-[#848d97]">$1.00 each</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveService('humanization')}
                  className="flex items-center p-3 bg-[#21262d] hover:bg-[#30363d] rounded-md transition-colors border border-[#30363d] text-left col-span-2 lg:col-span-1"
                >
                  <span className="text-lg mr-3">✨</span>
                  <div>
                    <div className="text-sm font-medium text-[#e6edf3]">AI Humanization</div>
                    <div className="text-xs text-[#848d97]">$0.015/word</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
              <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">Your Recent Orders</h2>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-[#848d97]">
                  <div className="text-4xl mb-2">📦</div>
                  <div>No orders yet</div>
                  <div className="text-sm">Start your first campaign above</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#30363d]">
                        <th className="text-left py-2 px-3 text-[#848d97] font-medium">Order ID</th>
                        <th className="text-left py-2 px-3 text-[#848d97] font-medium">Service</th>
                        <th className="text-left py-2 px-3 text-[#848d97] font-medium">Status</th>
                        <th className="text-left py-2 px-3 text-[#848d97] font-medium">Date</th>
                        <th className="text-left py-2 px-3 text-[#848d97] font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b border-[#30363d] hover:bg-[#21262d] transition-colors">
                          <td className="py-3 px-3">
                            <Link href={`/dashboard/orders/${order.id}`} className="text-[#2f81f7] hover:text-[#79c0ff] font-medium">
                              {order.orderId}
                            </Link>
                          </td>
                          <td className="py-3 px-3 text-[#e6edf3]">{getServiceName(order.service || '')}</td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-[#238636] text-white' :
                              order.status === 'pending' ? 'bg-[#bb8009] text-white' :
                              'bg-[#6e7681] text-white'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#848d97]">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="py-3 px-3 text-[#e6edf3]">${order.totalCost?.toFixed(2) || order.amount?.toFixed(2) || '0.00'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {orders.length > 5 && (
                <div className="text-center mt-4">
                  <Link href="/dashboard/orders" className="text-[#2f81f7] hover:text-[#79c0ff] text-sm font-medium">
                    View all orders →
                  </Link>
                </div>
              )}
            </div>

            {/* Pro Tip Section */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
              <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">💡 Pro Tip</h2>
              <div className="text-[#e6edf3]">
                <p className="mb-2">Did you know? Comments on Reddit have 5x higher engagement than other platforms.</p>
                <p className="text-sm text-[#848d97]">Mix platforms in your campaigns for maximum reach and diverse audience engagement.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#30363d] mt-12">
        <div className="px-8 py-4 text-center text-xs text-[#848d97]">
          Baruch Hashem Adonai
        </div>
      </div>

      {/* Service Request Modal */}
      {activeService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-md w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#e6edf3] mb-4">
                New {getServiceName(activeService)} Order
              </h3>

              <div className="space-y-4">
                {/* Comment Writing Form */}
                {activeService === 'comment' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Product Name *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                        placeholder="Enter your product name"
                        onChange={(e) => updateFormData('productName', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Platforms *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Twitter', 'Reddit', 'LinkedIn', 'Instagram', 'Facebook', 'TikTok', 'Quora'].map(platform => (
                          <label key={platform} className="flex items-center text-[#e6edf3] text-sm">
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
                            {platform}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Quantity (1-100) *</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                        onChange={(e) => updateFormData('quantity', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Tone</label>
                      <select
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
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
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Special Instructions</label>
                      <textarea
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                        rows={3}
                        placeholder="Any specific requirements..."
                        onChange={(e) => updateFormData('specialInstructions', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Product Search Form */}
                {activeService === 'search' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Product Name *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                        placeholder="Enter your product name"
                        onChange={(e) => updateFormData('productName', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Target Keywords (Optional)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                        placeholder="e.g., best, reviews, alternatives"
                        onChange={(e) => updateFormData('targetKeywords', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Influencer Research Form */}
                {activeService === 'influencer' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Niche *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                        placeholder="e.g., fitness, SaaS, beauty, gaming"
                        onChange={(e) => updateFormData('niche', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Platform Preference</label>
                      <select
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
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
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Number of Influencers (1-50) *</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                        onChange={(e) => updateFormData('numInfluencers', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Budget Range (Optional)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                        placeholder="e.g., $500-$2000 per post"
                        onChange={(e) => updateFormData('budgetRange', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Product Reviews Form */}
                {activeService === 'review' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Product Name *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                        placeholder="Enter your product name"
                        onChange={(e) => updateFormData('productName', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Platform *</label>
                      <select
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
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
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Rating Preference *</label>
                      <select
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                        onChange={(e) => updateFormData('ratingPreference', e.target.value)}
                      >
                        <option value="">Select preference</option>
                        <option value="5-star focused">5-star focused</option>
                        <option value="authentic honest">Authentic honest</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Key Points to Mention</label>
                      <textarea
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                        rows={3}
                        placeholder="Specific features or benefits to highlight in the review"
                        onChange={(e) => updateFormData('keyPoints', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* AI Content Humanization Form */}
                {activeService === 'humanization' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#e6edf3] mb-2">Upload AI Content *</label>
                      <input
                        type="file"
                        accept=".txt,.docx,.pdf"
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] file:bg-[#2f81f7] file:text-white file:border-none file:px-3 file:py-1 file:rounded file:mr-3 file:text-sm focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                        onChange={(e) => updateFormData('file', e.target.files?.[0])}
                      />
                      <p className="text-xs text-[#848d97] mt-1">Supported formats: .txt, .docx, .pdf</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#e6edf3] mb-2">Word Count *</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                          placeholder="Enter word count"
                          onChange={(e) => updateFormData('wordCount', parseInt(e.target.value))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#e6edf3] mb-2">Deadline</label>
                        <input
                          type="datetime-local"
                          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                          onChange={(e) => updateFormData('deadline', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handleSubmit(activeService)}
                  className="flex-1 bg-[#238636] hover:bg-[#2ea043] text-white py-2 px-4 rounded-md transition-colors font-medium"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setActiveService(null)}
                  className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}