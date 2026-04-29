"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { toast } from "@/components/ui/toast"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Trello-style Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">OpulFlow</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {stats.totalOrders} boards • {stats.completedOrders} completed
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm cursor-pointer hover:shadow-lg transition-shadow">
                {getUserInitials(user?.email || '')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Trello Board Style */}
      <main className="flex-1 p-6">
        <div className="max-w-full">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{greeting}</h2>
            <p className="text-gray-600">Manage your marketing campaigns and track progress</p>
          </div>

          {/* Service Boards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {/* Comment Writing Board */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group transform hover:-translate-y-1 transition-transform duration-200"
                 onClick={() => { setActiveService('comment'); setFormData({}) }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                  <span className="text-blue-600 text-lg">💬</span>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">$0.30</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-200">Comment Writing</h3>
              <p className="text-sm text-gray-600 mb-3">Generate authentic comments for Reddit, Twitter, and platforms</p>
              <div className="flex items-center text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">Marketing</span>
              </div>
            </div>

            {/* Product Search Board */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group transform hover:-translate-y-1 transition-transform duration-200"
                 onClick={() => { setActiveService('search'); setFormData({}) }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                  <span className="text-green-600 text-lg">🔍</span>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">FREE</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors duration-200">Product Search</h3>
              <p className="text-sm text-gray-600 mb-3">Find trending discussions and opportunities</p>
              <div className="flex items-center text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">Research</span>
              </div>
            </div>

            {/* Influencer Research Board */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group transform hover:-translate-y-1 transition-transform duration-200"
                 onClick={() => { setActiveService('influencer'); setFormData({}) }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                  <span className="text-purple-600 text-lg">👥</span>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">$0.30</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors duration-200">Influencer Research</h3>
              <p className="text-sm text-gray-600 mb-3">Discover perfect influencers for your niche</p>
              <div className="flex items-center text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">Outreach</span>
              </div>
            </div>

            {/* Product Reviews Board */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group transform hover:-translate-y-1 transition-transform duration-200"
                 onClick={() => { setActiveService('review'); setFormData({}) }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200">
                  <span className="text-orange-600 text-lg">⭐</span>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">$1.00</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-700 transition-colors duration-200">Product Reviews</h3>
              <p className="text-sm text-gray-600 mb-3">Generate authentic reviews for marketplaces</p>
              <div className="flex items-center text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">Reviews</span>
              </div>
            </div>

            {/* AI Humanization Board */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group transform hover:-translate-y-1 transition-transform duration-200 md:col-span-2 lg:col-span-1"
                 onClick={() => { setActiveService('humanization'); setFormData({}) }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors duration-200">
                  <span className="text-pink-600 text-lg">✨</span>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">$0.015</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-pink-700 transition-colors duration-200">AI Humanization</h3>
              <p className="text-sm text-gray-600 mb-3">Transform AI content into natural text</p>
              <div className="flex items-center text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">Content</span>
              </div>
            </div>
          </div>

          {/* Service Order Form - Appears when service is selected */}
          {activeService && (
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{getServiceName(activeService)}</h3>
                  <p className="text-gray-600 mt-1">Complete the details below to place your order</p>
                </div>
                <button
                  onClick={() => { setActiveService(null); setFormData({}) }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {activeService === 'comment' && (
                  <div className="grid gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product/Service Name *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your product or service name"
                        onChange={(e) => updateFormData('productName', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Platforms *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {[
                          'Twitter/X', 'Reddit', 'LinkedIn', 'Instagram', 'Facebook',
                          'TikTok', 'Quora', 'YouTube', 'Discord', 'Telegram'
                        ].map(platform => (
                          <label key={platform} className="flex items-center space-x-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              onChange={(e) => {
                                const current = formData.platforms || []
                                if (e.target.checked) {
                                  updateFormData('platforms', [...current, platform])
                                } else {
                                  updateFormData('platforms', current.filter(p => p !== platform))
                                }
                              }}
                            />
                            <span className="text-sm text-gray-700">{platform}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comment Type</label>
                        <select
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (1-100) *</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          onChange={(e) => updateFormData('quantity', parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                      <textarea
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your product name"
                        onChange={(e) => updateFormData('productName', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Keywords (Optional)</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., best, reviews, alternatives"
                        onChange={(e) => updateFormData('targetKeywords', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {activeService === 'influencer' && (
                  <div className="grid gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Niche *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., fitness, SaaS, beauty, gaming"
                        onChange={(e) => updateFormData('niche', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Influencer Size</label>
                        <select
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Influencers (1-50) *</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          onChange={(e) => updateFormData('numInfluencers', parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range (Optional)</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., $500-$2000 per post"
                        onChange={(e) => updateFormData('budgetRange', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {activeService === 'review' && (
                  <div className="grid gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your product name"
                        onChange={(e) => updateFormData('productName', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform *</label>
                        <select
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating Preference *</label>
                        <select
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Key Points to Mention</label>
                      <textarea
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload AI Content *</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept=".txt,.docx,.pdf"
                          className="hidden"
                          id="file-upload"
                          onChange={(e) => updateFormData('file', e.target.files?.[0])}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <div className="text-4xl text-gray-400 mb-2">📄</div>
                          <p className="text-gray-600">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-500 mt-1">Supported formats: .txt, .docx, .pdf</p>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Word Count *</label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter word count"
                          onChange={(e) => updateFormData('wordCount', parseInt(e.target.value))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                        <input
                          type="datetime-local"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          onChange={(e) => updateFormData('deadline', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleSubmit(activeService)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Continue to Payment →
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveService(null); setFormData({}) }}
                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-gray-600 text-sm">Your activity will appear here once you start using our services.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
