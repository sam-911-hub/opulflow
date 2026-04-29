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
        console.log('Dashboard: onboarding check', { onboardingCompletedKey, onboardingCompleted })
        if (!onboardingCompleted) {
          // New user - redirect to onboarding
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

  const getCommentCount = (): number => {
    const totalComments = orders
      .filter(o => o.service === 'comment')
      .reduce((sum, o) => sum + (o.totalCost ? Math.round(o.totalCost / 0.30) : 0), 0)
    return totalComments
  }

  const calculateCost = (service: string, data: ServiceFormData) => {
    switch (service) {
      case 'comment':
        const quantity = data.quantity || 0
        const currentComments = getCommentCount()
        
        // First 20 comments are free
        if (currentComments >= 20) {
          // All paid at regular rate
          if (quantity >= 100) return quantity * 0.30 * 0.8
          if (quantity >= 50) return quantity * 0.30 * 0.9
          return quantity * 0.30
        }
        
        const freeRemaining = Math.max(0, 20 - currentComments)
        const chargeable = Math.max(0, quantity - freeRemaining)
        
        if (chargeable >= 100) return chargeable * 0.30 * 0.8
        if (chargeable >= 50) return chargeable * 0.30 * 0.9
        return chargeable * 0.30
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
                  <div className="text-sm text-slate-600">
                    {stats.totalOrders} orders • {stats.completedOrders} completed
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                ← Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
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
                Get started →
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
          <div className="xl:col-span-4 space-y-8">
            {/* Welcome Hero */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-2xl lg:text-3xl font-bold mb-4">Ready to amplify your online presence?</h2>
                <p className="text-blue-100 mb-6 max-w-2xl text-sm lg:text-base">
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

            {/* Quick Actions - Enhanced Visibility */}
            <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl shadow-xl border border-blue-200 p-6 lg:p-10 relative overflow-hidden">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-pink-200/30 to-blue-200/30 rounded-full translate-y-12 -translate-x-12"></div>

              {/* Popular badge */}
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full mb-4 shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Most Popular Services
              </div>

              {/* CTA Banner */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4 lg:p-6 rounded-2xl mb-6 lg:mb-8 relative z-10 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold mb-2">🎯 Ready to Boost Your Online Presence?</h2>
                    <p className="text-blue-100 text-sm lg:text-base">Get started with our professional services - results guaranteed!</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center text-xs lg:text-sm font-bold">✓</div>
                      <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center text-xs lg:text-sm font-bold">✓</div>
                      <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center text-xs lg:text-sm font-bold">✓</div>
                    </div>
                    <span className="text-xs lg:text-sm text-blue-100 ml-2">1000+ satisfied customers</span>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3 relative z-10">🚀 Choose Your Service</h3>
              <p className="text-slate-600 mb-6 lg:mb-8 text-base lg:text-lg relative z-10">Select from our premium services to boost your online presence</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6 relative z-10">
                <button
                  onClick={() => { setActiveService('comment'); setFormData({}) }}
                  className="group relative p-4 lg:p-8 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-150 border-2 border-blue-200 rounded-2xl hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300 text-left transform hover:-translate-y-2 overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Popular badge for this service */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ⭐ TOP
                  </div>

                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 lg:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg relative z-10">
                    <span className="text-lg lg:text-2xl">💬</span>
                  </div>

                  <h4 className="font-bold text-slate-900 mb-2 lg:mb-3 text-base lg:text-lg group-hover:text-blue-700 transition-colors relative z-10">Comment Writing</h4>
                  <p className="text-slate-600 mb-3 lg:mb-4 leading-relaxed text-sm lg:text-base relative z-10">Generate authentic comments for Reddit, Twitter, and more platforms to boost engagement.</p>

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-600">$0.30</span>
                      <span className="text-sm text-slate-500">each</span>
                    </div>
                    <div className="flex items-center space-x-1 text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                      <span>Start Now</span>
                      <span className="text-xl">→</span>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 border-2 border-blue-300 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </button>

                <button
                  onClick={() => { setActiveService('search'); setFormData({}) }}
                  className="group relative p-4 lg:p-8 bg-gradient-to-br from-green-50 via-green-100 to-emerald-150 border-2 border-green-200 rounded-2xl hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-300 text-left transform hover:-translate-y-2 overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Free badge */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🆓 FREE
                  </div>

                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white mb-4 lg:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg relative z-10">
                    <span className="text-xl lg:text-3xl">🔍</span>
                  </div>

                  <h4 className="font-bold text-slate-900 mb-2 lg:mb-3 text-base lg:text-lg group-hover:text-green-700 transition-colors relative z-10">Product Search</h4>
                  <p className="text-slate-600 mb-3 lg:mb-4 leading-relaxed text-sm lg:text-base relative z-10">Find trending discussions and opportunities for your product mentions.</p>

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-600">FREE</span>
                      <span className="text-sm text-slate-500">unlimited</span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
                      <span>Discover</span>
                      <span className="text-xl">→</span>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 border-2 border-green-300 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </button>

                <button
                  onClick={() => { setActiveService('influencer'); setFormData({}) }}
                  className="group relative p-4 lg:p-8 bg-gradient-to-br from-purple-50 via-purple-100 to-violet-150 border-2 border-purple-200 rounded-2xl hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300 text-left transform hover:-translate-y-2 overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-violet-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Trending badge */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🔥 HOT
                  </div>

                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center text-white mb-4 lg:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg relative z-10">
                    <span className="text-xl lg:text-3xl">👥</span>
                  </div>

                  <h4 className="font-bold text-slate-900 mb-2 lg:mb-3 text-base lg:text-lg group-hover:text-purple-700 transition-colors relative z-10">Influencer Research</h4>
                  <p className="text-slate-600 mb-3 lg:mb-4 leading-relaxed text-sm lg:text-base relative z-10">Discover perfect influencers for your niche and budget with detailed analytics.</p>

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-600">$0.30</span>
                      <span className="text-sm text-slate-500">per influencer</span>
                    </div>
                    <div className="flex items-center space-x-1 text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
                      <span>Find Now</span>
                      <span className="text-xl">→</span>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 border-2 border-purple-300 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </button>

                <button
                  onClick={() => { setActiveService('review'); setFormData({}) }}
                  className="group relative p-4 lg:p-8 bg-gradient-to-br from-orange-50 via-orange-100 to-red-150 border-2 border-orange-200 rounded-2xl hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-300 text-left transform hover:-translate-y-2 overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Premium badge */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    💎 PREMIUM
                  </div>

                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white mb-4 lg:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg relative z-10">
                    <span className="text-xl lg:text-3xl">⭐</span>
                  </div>

                  <h4 className="font-bold text-slate-900 mb-2 lg:mb-3 text-base lg:text-lg group-hover:text-orange-700 transition-colors relative z-10">Product Reviews</h4>
                  <p className="text-slate-600 mb-3 lg:mb-4 leading-relaxed text-sm lg:text-base relative z-10">Generate authentic reviews for app stores, Amazon, and marketplaces.</p>

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-600">$1.00</span>
                      <span className="text-sm text-slate-500">per review</span>
                    </div>
                    <div className="flex items-center space-x-1 text-orange-600 font-semibold group-hover:translate-x-2 transition-transform">
                      <span>Get Reviews</span>
                      <span className="text-xl">→</span>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 border-2 border-orange-300 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </button>

                <button
                  onClick={() => { setActiveService('humanization'); setFormData({}) }}
                  className="group relative p-6 lg:p-8 bg-gradient-to-br from-pink-50 via-pink-100 to-rose-150 border-2 border-pink-200 rounded-2xl hover:shadow-2xl hover:shadow-pink-200/50 transition-all duration-300 text-left transform hover:-translate-y-2 overflow-hidden sm:col-span-2 xl:col-span-3 2xl:col-span-4"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* New badge */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ✨ NEW
                  </div>

                  <div className="flex items-center justify-center mb-4 lg:mb-6">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg relative z-10">
                      <span className="text-2xl lg:text-4xl">✨</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="font-bold text-slate-900 mb-2 lg:mb-3 text-lg lg:text-xl group-hover:text-pink-700 transition-colors relative z-10">AI Content Humanization</h4>
                    <p className="text-slate-600 mb-4 lg:mb-6 leading-relaxed max-w-2xl mx-auto text-sm lg:text-base relative z-10">Transform robotic AI-generated content into natural, engaging, human-sounding text that resonates with readers.</p>

                    <div className="flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-6 xl:space-x-8 relative z-10">
                      <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-green-600">$0.015</div>
                        <div className="text-xs lg:text-sm text-slate-500">per word</div>
                      </div>
                      <div className="hidden lg:block w-px h-10 lg:h-12 bg-slate-300"></div>
                      <div className="text-center">
                        <div className="text-base lg:text-lg font-semibold text-slate-900">Unlimited Projects</div>
                        <div className="text-xs lg:text-sm text-slate-500">No monthly limits</div>
                      </div>
                      <div className="hidden lg:block w-px h-10 lg:h-12 bg-slate-300"></div>
                      <div className="flex items-center space-x-1 text-pink-600 font-semibold group-hover:translate-x-2 transition-transform cursor-pointer">
                        <span className="text-base lg:text-lg">Humanize Now</span>
                        <span className="text-xl lg:text-2xl">→</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 border-2 border-pink-300 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </button>
              </div>
            </div>

            {/* Service Order Form - Inline Display */}
            {activeService && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 lg:p-8 mt-6 lg:mt-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-2">Place order</p>
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-900">{getServiceName(activeService)}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Complete the details below to submit your order and continue to payment.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setActiveService(null); setFormData({}) }}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg self-start sm:self-center"
                  >
                    ✕ Cancel Order
                  </button>
                </div>

                <div className="space-y-6">
                  {activeService === 'comment' && (
                    <div className="grid gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Product/Service Name *</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter your product or service name"
                          onChange={(e) => updateFormData('productName', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Platforms *</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {[
                            'Twitter/X', 'Reddit', 'LinkedIn', 'Instagram', 'Facebook',
                            'TikTok', 'Quora', 'YouTube', 'Discord', 'Telegram'
                          ].map(platform => (
                            <label key={platform} className="flex items-center space-x-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                                onChange={(e) => {
                                  const current = formData.platforms || []
                                  if (e.target.checked) {
                                    updateFormData('platforms', [...current, platform])
                                  } else {
                                    updateFormData('platforms', current.filter(p => p !== platform))
                                  }
                                }}
                              />
                              <span className="text-sm text-slate-700">{platform}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Comment Type</label>
                          <select
                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            onChange={(e) => updateFormData('commentType', e.target.value)}
                          >
                            <option value="">Select type</option>
                            <option value="question">Question/Help Request</option>
                            <option value="recommendation">Recommendation Request</option>
                            <option value="complaint">Complaint/Issue</option>
                            <option value="praise">Praise/Positive Feedback</option>
                            <option value="comparison">Comparison Request</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Quantity (1-100) *</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            onChange={(e) => updateFormData('quantity', parseInt(e.target.value))}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Special Instructions</label>
                        <textarea
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          rows={4}
                          placeholder="Any specific requirements or preferences..."
                          onChange={(e) => updateFormData('specialInstructions', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {activeService === 'search' && (
                    <div className="grid gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Product Name *</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter your product name"
                          onChange={(e) => updateFormData('productName', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Target Keywords (Optional)</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="e.g., best, reviews, alternatives"
                          onChange={(e) => updateFormData('targetKeywords', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {activeService === 'influencer' && (
                    <div className="grid gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Niche *</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="e.g., fitness, SaaS, beauty, gaming"
                          onChange={(e) => updateFormData('niche', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Influencer Size</label>
                          <select
                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            onChange={(e) => updateFormData('influencerSize', e.target.value)}
                          >
                            <option value="">Any size</option>
                            <option value="nano">Nano (1K-10K)</option>
                            <option value="micro">Micro (10K-100K)</option>
                            <option value="mid">Mid-tier (100K-500K)</option>
                            <option value="macro">Macro (500K-1M)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Number of Influencers (1-50) *</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            onChange={(e) => updateFormData('numInfluencers', parseInt(e.target.value))}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Budget Range (Optional)</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="e.g., $500-$2000 per post"
                          onChange={(e) => updateFormData('budgetRange', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {activeService === 'review' && (
                    <div className="grid gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Product Name *</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter your product name"
                          onChange={(e) => updateFormData('productName', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Platform *</label>
                          <select
                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            onChange={(e) => updateFormData('platform', e.target.value)}
                          >
                            <option value="">Select platform</option>
                            <option value="App Store">App Store</option>
                            <option value="Google Play">Google Play</option>
                            <option value="Amazon">Amazon</option>
                            <option value="Trustpilot">Trustpilot</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Rating Preference *</label>
                          <select
                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            onChange={(e) => updateFormData('ratingPreference', e.target.value)}
                          >
                            <option value="">Select preference</option>
                            <option value="5-star focused">5-star focused</option>
                            <option value="4-star positive">4-star positive</option>
                            <option value="authentic honest">Authentic honest</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Key Points to Mention</label>
                        <textarea
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          rows={4}
                          placeholder="Specific features or benefits to highlight in the review"
                          onChange={(e) => updateFormData('keyPoints', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {activeService === 'humanization' && (
                    <div className="grid gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Upload AI Content *</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            accept=".txt,.docx,.pdf"
                            className="hidden"
                            id="file-upload"
                            onChange={(e) => updateFormData('file', e.target.files?.[0])}
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <div className="text-4xl text-slate-400 mb-2">📄</div>
                            <p className="text-slate-600">Click to upload or drag and drop</p>
                            <p className="text-sm text-slate-500 mt-1">Supported formats: .txt, .docx, .pdf</p>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Word Count *</label>
                          <input
                            type="number"
                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter word count"
                            onChange={(e) => updateFormData('wordCount', parseInt(e.target.value))}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Deadline</label>
                          <input
                            type="datetime-local"
                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            onChange={(e) => updateFormData('deadline', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                    <button
                      onClick={() => handleSubmit(activeService)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Continue to Payment →
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveService(null); setFormData({}) }}
                      className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}