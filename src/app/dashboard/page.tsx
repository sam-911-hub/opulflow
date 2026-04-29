"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { toast } from "@/components/ui/toast"
import { ChevronRightIcon } from "lucide-react"
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
  contentText?: string
}

const PLATFORMS = ["Twitter", "Reddit", "LinkedIn", "Instagram", "Facebook", "TikTok", "Quora"]
const TONNES = ["Friendly", "Professional", "Enthusiastic"]
const REVIEW_PLATFORMS = ["Amazon", "App Store", "Google Play", "Product Hunt", "Trustpilot", "Other"]
const RATING_OPTIONS = ["4 stars", "4.5 stars", "5 stars"]

const countWords = (text?: string) => {
  return text?.trim().split(/\s+/).filter(Boolean).length || 0
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [orders, setOrders] = useState<OrderInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeService, setActiveService] = useState<string | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>({})
  const [activeNav, setActiveNav] = useState('dashboard')
  const [notificationsExpanded, setNotificationsExpanded] = useState(false)
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
              } : null)
              console.log('Dashboard: User document exists, updated data')
            }
          } catch (firestoreError) {
            console.warn('Firestore check failed:', firestoreError)
          }
        }, 200)

        setUser(userInfo)
        console.log('Dashboard: User set, userInfo:', userInfo)

        // Check if user should see onboarding for this specific account
        const onboardingCompletedKey = `onboardingCompleted_${userInfo.uid}`
        const onboardingCompleted = localStorage.getItem(onboardingCompletedKey)
        console.log('Dashboard: onboarding check', { onboardingCompletedKey, onboardingCompleted, credits: userInfo.credits })
        if (!onboardingCompleted && userInfo.credits === 20) {
          // New user with default credits - redirect to onboarding
          console.log('Dashboard: redirecting new user to onboarding')
          router.push('/onboarding')
          return
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
        const words = data.wordCount || countWords(data.contentText)
        return words * 0.015
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
        if (!formData.contentText?.trim()) {
          toast.error('Please enter the text you want to humanize')
          return
        }
        if (!formData.wordCount && countWords(formData.contentText) === 0) {
          toast.error('Please enter a valid word count')
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
      case 'comment': return 'C'
      case 'search': return 'S'
      case 'influencer': return 'I'
      case 'review': return 'R'
      case 'humanization': return 'H'
      default: return '?'
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = getStats()
  // const chartData = getChartData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {getUserInitials(user?.email || '')}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {greeting}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {user?.credits || 0} credits available
                  </div>
                  <div className="text-sm text-slate-600">
                    {stats.totalOrders} orders • {stats.completedOrders} completed
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/buy-credits"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Buy Credits
              </Link>
              <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                ← Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <nav className="space-y-2">
                <Link
                  href="/dashboard"
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeNav === 'dashboard'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  onClick={() => setActiveNav('dashboard')}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v2H8V5z" />
                  </svg>
                  Dashboard
                </Link>

                <Link
                  href="/dashboard/orders"
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeNav === 'orders'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  onClick={() => setActiveNav('orders')}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  My Orders
                </Link>

                <Link
                  href="/dashboard/settings"
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeNav === 'settings'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  onClick={() => setActiveNav('settings')}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Orders</span>
                  <span className="font-semibold text-slate-900">{stats.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Completed</span>
                  <span className="font-semibold text-green-600">{stats.completedOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">In Progress</span>
                  <span className="font-semibold text-blue-600">{stats.pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Credits</span>
                  <span className="font-semibold text-purple-600">{user?.credits || 0}</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">💡 Pro Tip</h3>
              <p className="text-sm text-slate-700 mb-3">
                Comments on Reddit have 5x higher engagement than other platforms. Try our comment writing service to boost your visibility!
              </p>
              <button
                onClick={() => setActiveService('comment')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Try it now →
              </button>
            </div>

            {/* Admin Access */}
            {user?.email === 'opulflow.inc@gmail.com' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <Link
                  href="/admin/verify-payments"
                  className="inline-flex items-center px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Admin Panel →
                </Link>
              </div>
            )}

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

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Welcome Hero */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Ready to amplify your online presence?</h2>
                <p className="text-blue-100 mb-6 max-w-2xl">
                  Choose from our suite of AI-powered services to generate authentic content, find influencers, and boost your brand visibility across platforms.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveService('comment')}
                    className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white font-medium hover:bg-white/30 transition-all duration-200"
                  >
                    <span className="mr-2">💬</span>
                    Start with Comments
                  </button>
                  <button
                    onClick={() => setActiveService('influencer')}
                    className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white font-medium hover:bg-white/30 transition-all duration-200"
                  >
                    <span className="mr-2">👥</span>
                    Find Influencers
                  </button>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Choose Your Service</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button
                  onClick={() => { setActiveService('comment'); setFormData({}) }}
                  className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:shadow-lg transition-all duration-200 text-left"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-xl">C</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Comment Writing</h4>
                  <p className="text-sm text-slate-600 mb-3">Generate authentic comments for Reddit, Twitter, and more platforms.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">$0.30 each</span>
                    <span className="text-blue-500 group-hover:translate-x-1 transition-transform">&gt;</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveService('search'); setFormData({}) }}
                  className="group p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl hover:shadow-lg transition-all duration-200 text-left"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-xl">🔍</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Product Search</h4>
                  <p className="text-sm text-slate-600 mb-3">Find trending discussions and opportunities for your product.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">Free</span>
                    <span className="text-green-500 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveService('influencer'); setFormData({}) }}
                  className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:shadow-lg transition-all duration-200 text-left"
                >
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-xl">👥</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Influencer Research</h4>
                  <p className="text-sm text-slate-600 mb-3">Discover perfect influencers for your niche and budget.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-600">$0.30 each</span>
                    <span className="text-purple-500 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveService('review'); setFormData({}) }}
                  className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl hover:shadow-lg transition-all duration-200 text-left"
                >
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-xl">⭐</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Product Reviews</h4>
                  <p className="text-sm text-slate-600 mb-3">Generate authentic reviews for app stores and marketplaces.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-orange-600">$1.00 each</span>
                    <span className="text-orange-500 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveService('humanization'); setFormData({}) }}
                  className="group p-6 bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-xl hover:shadow-lg transition-all duration-200 text-left"
                >
                  <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-xl">✨</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">AI Humanization</h4>
                  <p className="text-sm text-slate-600 mb-3">Transform AI content into natural, human-sounding text.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-pink-600">$0.015/word</span>
                    <span className="text-pink-500 group-hover:translate-x-1 transition-transform">→</span>
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

            {/* Recent Orders */}
            {false && orders.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">Recent Orders</h3>
                  <Link href="/dashboard/orders" className="text-blue-600 hover:text-blue-700 font-medium">
                    View all →
                  </Link>
                </div>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600">{getServiceIcon(order.service || '')}</span>
                        </div>
                        <div>
                          <Link href={`/dashboard/orders/${order.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                            Order {order.orderId}
                          </Link>
                          <p className="text-sm text-slate-600">{getServiceName(order.service || '')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {order.status}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">${order.totalCost?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Stories */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200 p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Success Stories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <blockquote className="text-slate-700 mb-4">
                    "OpulFlow's comment service boosted our Reddit engagement by 400%. Worth every credit!"
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      S
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Sarah Chen</p>
                      <p className="text-sm text-slate-600">SaaS Founder</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <blockquote className="text-slate-700 mb-4">
                    "Found amazing influencers for our niche. The research quality is outstanding!"
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      M
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Mike Johnson</p>
                      <p className="text-sm text-slate-600">Marketing Director</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



            {activeService && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-2">Place order</p>
                    <h3 className="text-2xl font-bold text-slate-900">{getServiceName(activeService)}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Complete the details below to submit your order and continue to payment.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setActiveService(null); setFormData({}) }}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-6">
                  {activeService === 'comment' && (
                    <div className="grid gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Product/Service Name</label>
                        <input
                          value={formData.productName || ''}
                          onChange={(e) => updateFormData('productName', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          placeholder="Enter your product or service name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Product Link (optional)</label>
                        <input
                          type="url"
                          value={formData.productLink || ''}
                          onChange={(e) => updateFormData('productLink', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          placeholder="https://your-product-link.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Target Platforms</label>
                        <div className="grid grid-cols-2 gap-2">
                          {PLATFORMS.map(platform => (
                            <button
                              key={platform}
                              type="button"
                              onClick={() => {
                                const currentPlatforms = formData.platforms || []
                                const nextPlatforms = currentPlatforms.includes(platform)
                                  ? currentPlatforms.filter((item) => item !== platform)
                                  : [...currentPlatforms, platform]
                                updateFormData('platforms', nextPlatforms)
                              }}
                              className={`rounded-xl border px-3 py-2 text-sm ${
                                (formData.platforms || []).includes(platform)
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {platform}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Quantity of comments</label>
                          <input
                            type="number"
                            min={1}
                            value={formData.quantity || 1}
                            onChange={(e) => updateFormData('quantity', parseInt(e.target.value, 10) || 1)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Tone of voice</label>
                          <select
                            value={formData.tone || TONNES[0]}
                            onChange={(e) => updateFormData('tone', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          >
                            {TONNES.map((tone) => (
                              <option key={tone} value={tone}>{tone}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Special instructions</label>
                        <textarea
                          value={formData.specialInstructions || ''}
                          onChange={(e) => updateFormData('specialInstructions', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  {activeService === 'search' && (
                    <div className="grid gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Product Name</label>
                        <input
                          value={formData.productName || ''}
                          onChange={(e) => updateFormData('productName', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          placeholder="Enter the product you want researched"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Target keywords / search terms</label>
                        <textarea
                          value={formData.targetKeywords || ''}
                          onChange={(e) => updateFormData('targetKeywords', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          rows={3}
                          placeholder="Enter topics, keywords, or categories to search for"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Deadline (optional)</label>
                        <input
                          type="date"
                          value={formData.deadline || ''}
                          onChange={(e) => updateFormData('deadline', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
                        />
                      </div>
                    </div>
                  )}

                  {activeService === 'influencer' && (
                    <div className="grid gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Niche / audience</label>
                        <input
                          value={formData.niche || ''}
                          onChange={(e) => updateFormData('niche', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          placeholder="Enter the niche or audience for influencer outreach"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Number of influencers</label>
                          <input
                            type="number"
                            min={1}
                            value={formData.numInfluencers || 1}
                            onChange={(e) => updateFormData('numInfluencers', parseInt(e.target.value, 10) || 1)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Target platform</label>
                          <input
                            value={formData.platformPreference || ''}
                            onChange={(e) => updateFormData('platformPreference', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                            placeholder="Instagram, TikTok, LinkedIn, etc."
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Budget range (optional)</label>
                        <input
                          value={formData.budgetRange || ''}
                          onChange={(e) => updateFormData('budgetRange', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          placeholder="e.g. $100 - $300"
                        />
                      </div>
                    </div>
                  )}

                  {activeService === 'review' && (
                    <div className="grid gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Product Name</label>
                        <input
                          value={formData.productName || ''}
                          onChange={(e) => updateFormData('productName', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          placeholder="Enter the product or service name"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
                          <select
                            value={formData.platform || REVIEW_PLATFORMS[0]}
                            onChange={(e) => updateFormData('platform', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          >
                            {REVIEW_PLATFORMS.map((platform) => (
                              <option key={platform} value={platform}>{platform}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Rating preference</label>
                          <select
                            value={formData.ratingPreference || RATING_OPTIONS[2]}
                            onChange={(e) => updateFormData('ratingPreference', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          >
                            {RATING_OPTIONS.map((rating) => (
                              <option key={rating} value={rating}>{rating}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Review focus</label>
                        <textarea
                          value={formData.reviewFocus || ''}
                          onChange={(e) => updateFormData('reviewFocus', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          rows={4}
                          placeholder="Mention the main points you'd like the review to cover"
                        />
                      </div>
                    </div>
                  )}

                  {activeService === 'humanization' && (
                    <div className="grid gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Text to humanize</label>
                        <textarea
                          value={formData.contentText || ''}
                          onChange={(e) => updateFormData('contentText', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          rows={6}
                          placeholder="Paste the AI generated draft you want rewritten to sound natural"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Word count</label>
                          <input
                            type="number"
                            min={1}
                            value={formData.wordCount || countWords(formData.contentText)}
                            onChange={(e) => updateFormData('wordCount', parseInt(e.target.value, 10) || 0)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Content focus</label>
                          <input
                            value={formData.contentFocus || ''}
                            onChange={(e) => updateFormData('contentFocus', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                            placeholder="Tone, audience, or outcome"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm text-slate-600">Estimated cost</p>
                    <p className="text-xl font-semibold text-slate-900">${calculateCost(activeService, formData).toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">You will continue to payment after submitting this order.</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSubmit(activeService)}
                  className="mt-6 w-full rounded-xl bg-orange-600 px-6 py-3 text-white text-sm font-semibold hover:bg-orange-700 transition-all duration-200"
                >
                  Continue to Payment
                </button>
              </div>
            )}
    </div>
    </div>
  )
}