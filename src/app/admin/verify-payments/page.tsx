"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/toast"

interface Order {
  id: string
  orderId: string
  userId: string
  userEmail: string
  service: string
  formData: Record<string, unknown>
  totalCost: number
  paymentMethod: string
  mpesaCode?: string
  status: string
  createdAt: Date
}

interface UserInfo {
  uid: string
  email: string
  credits: number
  accountType: string
}

export default function VerifyPaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()

  const checkAuthentication = async () => {
    try {
      const userRes = await fetch("/api/user")
      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData.user)

        // Check if user is admin
        if (userData.user.email !== 'opulflow.inc@gmail.com') {
          toast.error('Access denied. Admin privileges required.')
          router.push('/dashboard')
          return
        }

        // User is admin, fetch orders
        fetchPendingOrders()
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    } finally {
      setAuthLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    checkAuthentication()
  }, [])

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch('/api/admin/pending-orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifyPayment = async (orderId: string) => {
    setVerifying(orderId)
    try {
      const response = await fetch('/api/admin/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      })

      if (response.ok) {
        // Refresh orders list
        await fetchPendingOrders()
        toast.success('Payment verified successfully!')
      } else {
        toast.error('Failed to verify payment')
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      toast.error('Error verifying payment')
    } finally {
      setVerifying(null)
    }
  }

  const getServiceName = (service: string) => {
    switch (service) {
      case 'comment': return 'Comment Writing'
      case 'search': return 'Manual Product Search'
      case 'influencer': return 'Influencer Research'
      case 'review': return 'Product Reviews'
      case 'humanization': return 'AI Content Humanization'
      default: return service
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-[#848d97] text-xl">Verifying access...</div>
      </div>
    )
  }

  // Deny access if not admin
  if (!user || user.email !== 'opulflow.inc@gmail.com') {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-[#da3633] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#e6edf3] mb-4">Access Denied</h1>
          <p className="text-[#848d97] mb-6">
            You don&apos;t have permission to access this admin page.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#2f81f7] hover:bg-[#79c0ff] text-white px-6 py-3 rounded-md transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-[#848d97] text-xl">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Header */}
      <div className="border-b border-[#30363d] bg-[#161b22]">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[#e6edf3]">Verify Payments - Admin</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-[#2f81f7] hover:text-[#79c0ff] text-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[#e6edf3] mb-2">Pending Payment Verifications</h2>
            <p className="text-[#848d97]">
              {orders.length} orders awaiting verification
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-12 text-center">
              <div className="text-4xl mb-4">✅</div>
              <div className="text-xl text-[#e6edf3] mb-2">All Caught Up!</div>
              <div className="text-[#848d97]">No pending payments to verify at this time.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Order Details */}
                    <div>
                      <div className="text-sm text-[#848d97] mb-1">Order ID</div>
                      <div className="font-mono text-[#e6edf3]">{order.orderId}</div>
                    </div>

                    <div>
                      <div className="text-sm text-[#848d97] mb-1">Service</div>
                      <div className="text-[#e6edf3]">{getServiceName(order.service)}</div>
                    </div>

                    <div>
                      <div className="text-sm text-[#848d97] mb-1">Customer</div>
                      <div className="text-[#e6edf3]">{order.userEmail}</div>
                    </div>

                    <div>
                      <div className="text-sm text-[#848d97] mb-1">Amount</div>
                      <div className="text-[#e6edf3] font-medium">${order.totalCost.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="mt-6 pt-6 border-t border-[#30363d]">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-[#848d97] mb-2">Payment Method</div>
                        <div className="text-[#e6edf3] capitalize">{order.paymentMethod}</div>
                      </div>

                      {order.mpesaCode && (
                        <div>
                          <div className="text-sm text-[#848d97] mb-2">M-PESA Code</div>
                          <div className="font-mono text-[#e6edf3]">{order.mpesaCode}</div>
                        </div>
                      )}

                      <div>
                        <div className="text-sm text-[#848d97] mb-2">Order Date</div>
                        <div className="text-[#e6edf3]">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Unknown'}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-[#848d97] mb-2">Status</div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#bb8009] text-white">
                          Pending Verification
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Service-Specific Details */}
                  <div className="mt-6 pt-6 border-t border-[#30363d]">
                    <div className="text-sm text-[#848d97] mb-3">Order Details</div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      {order.service === 'comment' && (
                        <>
                          <div>
                            <span className="text-[#848d97]">Product:</span>
                            <span className="ml-2 text-[#e6edf3]">{String(order.formData?.productName || 'N/A')}</span>
                          </div>
                          <div>
                            <span className="text-[#848d97]">Quantity:</span>
                            <span className="ml-2 text-[#e6edf3]">{String(order.formData?.quantity || 0)} comments</span>
                          </div>
                          <div>
                            <span className="text-[#848d97]">Platforms:</span>
                            <span className="ml-2 text-[#e6edf3]">{Array.isArray(order.formData?.platforms) ? (order.formData.platforms as string[]).join(', ') : 'N/A'}</span>
                          </div>
                        </>
                      )}

                       {order.service === 'search' && (
                        <div>
                          <span className="text-[#848d97]">Product:</span>
                          <span className="ml-2 text-[#e6edf3]">{String(order.formData?.productName || 'N/A')}</span>
                        </div>
                      )}

                      {order.service === 'influencer' && (
                        <>
                          <div>
                            <span className="text-[#848d97]">Niche:</span>
                            <span className="ml-2 text-[#e6edf3]">{String(order.formData?.niche || 'N/A')}</span>
                          </div>
                          <div>
                            <span className="text-[#848d97]">Count:</span>
                            <span className="ml-2 text-[#e6edf3]">{String(order.formData?.numInfluencers || 0)}</span>
                          </div>
                        </>
                      )}

                      {order.service === 'review' && (
                        <>
                          <div>
                            <span className="text-[#848d97]">Product:</span>
                            <span className="ml-2 text-[#e6edf3]">{String(order.formData?.productName || 'N/A')}</span>
                          </div>
                          <div>
                            <span className="text-[#848d97]">Platform:</span>
                            <span className="ml-2 text-[#e6edf3]">{String(order.formData?.platform || 'N/A')}</span>
                          </div>
                        </>
                      )}

                      {order.service === 'humanization' && (
                        <>
                          <div>
                            <span className="text-[#848d97]">Words:</span>
                            <span className="ml-2 text-[#e6edf3]">{String(order.formData?.wordCount || 0)}</span>
                          </div>
                          <div>
                            <span className="text-[#848d97]">File:</span>
                            <span className="ml-2 text-[#e6edf3]">{String((order.formData?.file as any)?.name || 'Uploaded')}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-6 border-t border-[#30363d] flex justify-end">
                    <button
                      onClick={() => verifyPayment(order.orderId)}
                      disabled={verifying === order.orderId}
                      className="bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white px-6 py-2 rounded-md transition-colors font-medium"
                    >
                      {verifying === order.orderId ? 'Verifying...' : 'Verify Payment'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


    </div>
  )
}