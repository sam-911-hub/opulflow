"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { toast } from "@/components/ui/toast"
import { ChevronRightIcon } from "lucide-react"
import OnboardingModal from "@/components/OnboardingModal"
import { getFirebaseDb } from "@/lib/firebaseClient"
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Typing animation removed to prevent errors
// import { addPendingUserCreation } from "@/lib/offlinePersistence"

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
  platformPreferences?: string[]
  numInfluencers?: number
  budgetRange?: string
  platform?: string
  ratingPreference?: string
  keyPoints?: string
  file?: File
  wordCount?: number
  deadline?: string
  commentType?: string
  influencerSize?: string
  contentFocus?: string
  reviewFocus?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [orders, setOrders] = useState<OrderInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeService, setActiveService] = useState<string | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>({})
  const [activeNav, setActiveNav] = useState('dashboard')
  const [notificationsExpanded, setNotificationsExpanded] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const router = useRouter()

  const getStats = () => {
    const totalOrders = orders.length
    const completedOrders = orders.filter(o => o.status === 'completed').length
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    return { totalOrders, completedOrders, pendingOrders }
  }

  const getPersonalizedGreeting = () => {
    const name = user?.email?.split('@')[0] || 'there'
    const stats = getStats()

    if (stats.totalOrders === 0) {
      return `Welcome to OpulFlow, ${name}! Ready to boost your online presence? 🚀`
    } else if (stats.completedOrders > 0) {
      return `Welcome back, ${name}! ${stats.completedOrders} campaigns completed - you're crushing it! 💪`
    } else {
      return `Hey ${name}, ${stats.pendingOrders} campaigns in progress. Let's make them shine! ✨`
    }
  }

  const greeting = user ? getPersonalizedGreeting() : "Welcome to OpulFlow"

  // Arrays removed to prevent initialization errors

  useEffect(() => {
    async function fetchData() {
      console.log('Dashboard: Starting data fetch...')

      // Set loading to false immediately to prevent hang
      setLoading(false)

      try {
        // Add timeout to user fetch
        const userFetchPromise = fetch("/api/user")
        const userTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('User fetch timeout')), 10000)
        )

        const userRes = await Promise.race([userFetchPromise, userTimeoutPromise]) as Response
        if (!userRes.ok) {
          console.log('Dashboard: User fetch failed, redirecting to login')
          router.push("/login")
          return
        }
        const userData = await userRes.json()
        let userInfo = userData.user
        console.log('Dashboard: User data loaded')

        // Check for pending user document in localStorage (from failed registration)
        const pendingUserDocKey = `pendingUserDoc_${userInfo.uid}`;
        const pendingUserDoc = localStorage.getItem(pendingUserDocKey);

        if (pendingUserDoc) {
          // Firestore sync in background, don't wait
          setTimeout(async () => {
            try {
              const userData = JSON.parse(pendingUserDoc);
              const db = getFirebaseDb();
              const userDocRef = doc(db, 'users', userInfo.uid);
              await setDoc(userDocRef, userData);
              console.log('✅ Pending user document created from localStorage');
              localStorage.removeItem(pendingUserDocKey);
            } catch (error) {
              console.warn('Failed to create pending user document:', error);
            }
          }, 100)
        }

        // Safety fallback: Check if user document exists, create if missing
        // Do this in background
        setTimeout(async () => {
          try {
            console.log('Dashboard: Checking Firestore user document')
            const db = getFirebaseDb()
            const userDocRef = doc(db, 'users', userInfo.uid)

            const userDocSnap = await getDoc(userDocRef)

            if (!userDocSnap.exists()) {
              console.log('User document missing, creating with defaults...')
              const defaultUserData = {
                uid: userInfo.uid,
                email: userInfo.email,
                displayName: userInfo.email?.split('@')[0] || '',
                credits: 20,
                freeCreditsGiven: true,
                accountType: 'free',
                createdAt: new Date().toISOString(),
              }

              await setDoc(userDocRef, defaultUserData)
              console.log('✅ User document created successfully in dashboard')
            } else {
              // Update user info with actual data from Firestore
              const firestoreData = userDocSnap.data()
              setUser(prev => prev ? {
                ...prev,
                credits: firestoreData?.credits || 20,
                accountType: firestoreData?.accountType || 'free'
              } : prev)
              console.log('Dashboard: User document exists, updated data')
            }
          } catch (firestoreError) {
            console.warn('Firestore check failed:', firestoreError)
          }
        }, 200)

        setUser(userInfo)
        console.log('Dashboard: User set, userInfo:', userInfo)

        // Check if user should see onboarding
        const onboardingCompleted = localStorage.getItem('onboardingCompleted')
        if (!onboardingCompleted && userInfo.credits === 20) {
          // New user with default credits - show onboarding
          setTimeout(() => setShowOnboarding(true), 1000) // Small delay for better UX
        }

        // Load orders in background
        setTimeout(async () => {
          try {
            const ordersRes = await fetch("/api/orders")
            if (ordersRes.ok) {
              const odata = await ordersRes.json()
              setOrders(odata.orders || [])
              console.log('Dashboard: Orders loaded')
            }
          } catch (ordersError) {
            console.warn('Orders fetch failed:', ordersError)
            setOrders([])
          }
        }, 300)

        console.log('Dashboard: Data fetch initiated, UI should load now')
      } catch (e) {
        console.error("Dashboard: Error in fetchData", e)
        // If it's a timeout or network error, still allow access with default data
        if (e instanceof Error && (e.message?.includes('timeout') || e.message?.includes('fetch'))) {
          console.log('Dashboard: Network error, using default user data')
          setUser({
            uid: 'guest',
            email: 'guest@example.com',
            credits: 20,
            accountType: 'free'
          })
        } else {
          router.push("/login")
        }
      }
    }
    fetchData()
  }, [router])

  // Rotating effects temporarily disabled to prevent errors

  // Live activities simulation removed

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
    // Service-specific validation
    switch (service) {
      case 'comment':
        if (!formData.productName || !formData.platforms || formData.platforms.length === 0 || !formData.quantity) {
          toast.error('Please fill in product name, select platforms, and specify quantity')
          return
        }
        break
      case 'search':
        if (!formData.productName) {
          toast.error('Please enter a product name')
          return
        }
        break
      case 'influencer':
        if (!formData.niche || !formData.numInfluencers) {
          toast.error('Please fill in niche and number of influencers')
          return
        }
        break
      case 'review':
        if (!formData.productName || !formData.platform) {
          toast.error('Please fill in product name and select platform')
          return
        }
        break
      case 'humanization':
        if (!formData.file || !formData.wordCount) {
          toast.error('Please upload a file and specify word count')
          return
        }
        break
    }

    const cost = calculateCost(service, formData)
    if (cost < 0) {
      toast.error('Invalid order details')
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

  const updateFormData = (field: string, value: unknown) => {
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

  // const getChartData = () => { ... } // Temporarily removed

  const getRecommendations = () => {
    const usedServices = orders.map(o => o.service).filter(Boolean)
    const recommendations = []

    if (!usedServices.includes('comment')) {
      recommendations.push({
        service: 'comment',
        title: 'Start with Comments',
        reason: 'Comments drive engagement and build community around your product.'
      })
    }
    if (!usedServices.includes('review') && usedServices.length > 0) {
      recommendations.push({
        service: 'review',
        title: 'Add Product Reviews',
        reason: 'Reviews build trust and improve your online reputation.'
      })
    }
    if (!usedServices.includes('influencer') && usedServices.includes('comment')) {
      recommendations.push({
        service: 'influencer',
        title: 'Expand Reach with Influencers',
        reason: 'Influencers can amplify your message to larger audiences.'
      })
    }
    if (!usedServices.includes('humanization') && usedServices.length > 2) {
      recommendations.push({
        service: 'humanization',
        title: 'Perfect Your Content',
        reason: 'Make AI-generated content sound more natural and engaging.'
      })
    }

    return recommendations.slice(0, 2) // Max 2 recommendations
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-[#848d97] text-xl">Loading...</div>
      </div>
    )
  }

  const stats = getStats()
  // const chartData = getChartData()

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
                <h1 className="text-2xl font-semibold text-[#e6edf3]">
                  {greeting}
                </h1>
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

      {/* Main Content - Responsive Layout */}
      <div className="px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="w-full md:w-80 md:flex-shrink-0">
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

            {/* Personalized Recommendations */}
            {getRecommendations().length > 0 && (
              <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4">
                <h3 className="text-sm font-semibold text-[#e6edf3] mb-3">🎯 Recommended for You</h3>
                <div className="space-y-3">
                  {getRecommendations().map((rec, index) => (
                    <div key={index} className="p-3 bg-[#21262d] rounded-md hover:bg-[#30363d] transition-colors cursor-pointer"
                         onClick={() => setActiveService(rec.service)}>
                      <div className="font-medium text-[#e6edf3] text-sm">{rec.title}</div>
                      <div className="text-xs text-[#848d97] mt-1">{rec.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Success Stories */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
              <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">🌟 Success Stories</h2>
              <div className="text-[#e6edf3]">
                <blockquote className="text-sm italic mb-3">
                  "OpulFlow's comment service boosted our Reddit engagement by 400%. Worth every credit!"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#e6edf3]">Sarah Chen</div>
                    <div className="text-xs text-[#848d97]">SaaS Founder</div>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Right Column - Main Content */}
          <div className="flex-1 space-y-6">

            {/* Quick Actions */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
              <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveService('comment')}
                  className="flex items-center p-3 bg-[#21262d] hover:bg-[#30363d] rounded-md transition-colors border border-[#30363d] text-left group"
                  title="Generate authentic comments for Reddit, Twitter, and other platforms to boost engagement"
                >
                  <span className="text-lg mr-3">💬</span>
                  <div>
                    <div className="text-sm font-medium text-[#e6edf3]">Comment Writing</div>
                    <div className="text-xs text-[#848d97]">$0.30 each</div>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-[#2f81f7]">Learn more →</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveService('search')}
                  className="flex items-center p-3 bg-[#21262d] hover:bg-[#30363d] rounded-md transition-colors border border-[#30363d] text-left group"
                  title="Find trending discussions and opportunities for your product mentions"
                >
                  <span className="text-lg mr-3">🔍</span>
                <div>
                  <div className="text-sm font-medium text-[#e6edf3]">Product Search</div>
                  <div className="text-xs text-[#848d97]">Free</div>
                </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-[#2f81f7]">Learn more →</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveService('influencer')}
                  className="flex items-center p-3 bg-[#21262d] hover:bg-[#30363d] rounded-md transition-colors border border-[#30363d] text-left group"
                  title="Research and identify perfect influencers for your niche and budget"
                >
                  <span className="text-lg mr-3">👥</span>
                  <div>
                    <div className="text-sm font-medium text-[#e6edf3]">Influencer Research</div>
                    <div className="text-xs text-[#848d97]">$0.30 each</div>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-[#2f81f7]">Learn more →</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveService('review')}
                  className="flex items-center p-3 bg-[#21262d] hover:bg-[#30363d] rounded-md transition-colors border border-[#30363d] text-left group"
                  title="Generate authentic reviews for app stores, Amazon, and review sites"
                >
                  <span className="text-lg mr-3">⭐</span>
                  <div>
                    <div className="text-sm font-medium text-[#e6edf3]">Product Reviews</div>
                    <div className="text-xs text-[#848d97]">$1.00 each</div>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-[#2f81f7]">Learn more →</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveService('humanization')}
                  className="flex items-center p-3 bg-[#21262d] hover:bg-[#30363d] rounded-md transition-colors border border-[#30363d] text-left col-span-2 lg:col-span-1 group"
                  title="Transform AI-generated content into natural, human-sounding text"
                >
                  <span className="text-lg mr-3">✨</span>
                  <div>
                    <div className="text-sm font-medium text-[#e6edf3]">AI Humanization</div>
                    <div className="text-xs text-[#848d97]">$0.015/word</div>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-[#2f81f7]">Learn more →</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Analytics Dashboard - Temporarily disabled */}
            {false && orders.length > 0 && (
              <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
                <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">📊 Your Performance</h2>
                {/* Charts temporarily removed */}
              </div>
            )}

            {/* Notifications & Messages */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md">
              <button
                onClick={() => setNotificationsExpanded(!notificationsExpanded)}
                className="w-full flex items-center justify-between p-6 hover:bg-[#21262d] transition-colors rounded-md"
              >
                <h2 className="text-lg font-semibold text-[#e6edf3]">Notifications & Messages</h2>
                <ChevronRightIcon
                  className={`w-5 h-5 text-[#848d97] transition-transform ${notificationsExpanded ? 'rotate-90' : ''}`}
                />
              </button>
              {notificationsExpanded && (
                <div className="px-6 pb-6">
                  <div className="space-y-3">
                    {orders.length === 0 ? (
                      <div className="text-center py-6 text-[#848d97]">
                        <div className="text-3xl mb-2">📬</div>
                        <div>No notifications yet</div>
                        <div className="text-sm">Your activity notifications will appear here</div>
                      </div>
                    ) : (
                      orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-start space-x-3 p-3 bg-[#21262d] rounded-md">
                          <div className="w-6 h-6 bg-[#2f81f7] rounded-full flex items-center justify-center text-white text-xs mt-0.5">
                            ✓
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-[#e6edf3] font-medium">
                              {getServiceName(order.service || '')} order processed
                            </div>
                            <div className="text-xs text-[#848d97] mt-1">
                              Order {order.orderId} has been {order.status === 'verified' ? 'verified and is being processed' : order.status === 'paid' ? 'paid successfully' : 'submitted'}
                            </div>
                            <div className="text-xs text-[#848d97] mt-1">
                              {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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

            {/* Tips & Insights */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
              <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">💡 Pro Tips</h2>
              <div className="text-[#e6edf3]">
                <p className="mb-2">Did you know? Comments on Reddit have 5x higher engagement than other platforms.</p>
                <p className="text-sm text-[#848d97]">Mix platforms in your campaigns for maximum reach and diverse audience engagement.</p>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
              <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">📈 Recent Activity</h2>
              <div className="space-y-3">
                <div className="text-center py-4 text-[#848d97]">
                  Your activity will appear here once you start using our services.
                </div>
              </div>
            </div>
          </div>
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
                  {[
                    'Twitter/X', 'Reddit', 'LinkedIn', 'Instagram', 'Facebook',
                    'TikTok', 'Quora', 'YouTube', 'Discord', 'Telegram',
                    'Pinterest', 'Tumblr', 'Medium', 'HackerNews', 'ProductHunt'
                  ].map(platform => (
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
                <label className="block text-sm font-medium text-[#e6edf3] mb-2">Comment Type</label>
                <select
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                  onChange={(e) => updateFormData('commentType', e.target.value)}
                >
                  <option value="">Select type</option>
                  <option value="question">Question/Help Request</option>
                  <option value="recommendation">Recommendation Request</option>
                  <option value="complaint">Complaint/Issue</option>
                  <option value="praise">Praise/Positive Feedback</option>
                  <option value="comparison">Comparison Request</option>
                  <option value="tutorial">Tutorial/How-to</option>
                  <option value="review">Review Request</option>
                  <option value="discussion">General Discussion</option>
                </select>
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
                        <option value="urgent">Urgent/Important</option>
                        <option value="educational">Educational</option>
                        <option value="humorous">Humorous/Light</option>
                        <option value="controversial">Controversial</option>
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
                <label className="block text-sm font-medium text-[#e6edf3] mb-1">Platform Preferences</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'LinkedIn',
                    'Facebook', 'Pinterest', 'Snapchat', 'Twitch', 'Discord'
                  ].map(platform => (
                    <label key={platform} className="flex items-center text-[#e6edf3] text-sm">
                      <input
                        type="checkbox"
                        className="mr-2"
                        onChange={(e) => {
                          const current = formData.platformPreferences || []
                          if (e.target.checked) {
                            updateFormData('platformPreferences', [...current, platform])
                          } else {
                            updateFormData('platformPreferences', current.filter(p => p !== platform))
                          }
                        }}
                      />
                      {platform}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e6edf3] mb-1">Influencer Size</label>
                <select
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                  onChange={(e) => updateFormData('influencerSize', e.target.value)}
                >
                  <option value="">Any size</option>
                  <option value="nano">Nano (1K-10K)</option>
                  <option value="micro">Micro (10K-100K)</option>
                  <option value="mid">Mid-tier (100K-500K)</option>
                  <option value="macro">Macro (500K-1M)</option>
                  <option value="mega">Mega (1M+)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e6edf3] mb-1">Content Focus</label>
                <select
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                  onChange={(e) => updateFormData('contentFocus', e.target.value)}
                >
                  <option value="">Any focus</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="fashion">Fashion & Beauty</option>
                  <option value="tech">Technology</option>
                  <option value="gaming">Gaming</option>
                  <option value="food">Food & Cooking</option>
                  <option value="fitness">Fitness & Health</option>
                  <option value="travel">Travel</option>
                  <option value="business">Business & Finance</option>
                  <option value="education">Education</option>
                  <option value="entertainment">Entertainment</option>
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
                <label className="block text-sm font-medium text-[#e6edf3] mb-1">Rating Preference *</label>
                <select
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                  onChange={(e) => updateFormData('ratingPreference', e.target.value)}
                >
                  <option value="">Select preference</option>
                  <option value="5-star focused">5-star focused</option>
                  <option value="4-star positive">4-star positive</option>
                  <option value="3-star mixed">3-star mixed</option>
                  <option value="authentic honest">Authentic honest</option>
                  <option value="critical constructive">Critical but constructive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e6edf3] mb-1">Review Focus</label>
                <select
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                  onChange={(e) => updateFormData('reviewFocus', e.target.value)}
                >
                  <option value="">General review</option>
                  <option value="features">Feature highlights</option>
                  <option value="usability">Ease of use</option>
                  <option value="performance">Performance & speed</option>
                  <option value="support">Customer support</option>
                  <option value="pricing">Value for money</option>
                  <option value="comparison">Comparison with competitors</option>
                  <option value="pros-cons">Balanced pros & cons</option>
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

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  )
}