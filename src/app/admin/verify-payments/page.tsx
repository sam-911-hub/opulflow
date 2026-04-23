"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Order {
  id: string
  orderId: string
  userId: string
  userEmail: string
  service: string
  formData: any
  totalCost: number
  paymentMethod: string
  mpesaCode?: string
  status: string
  createdAt: any
}

export default function VerifyPaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchPendingOrders()
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
        alert('Payment verified successfully!')
      } else {
        alert('Failed to verify payment')
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      alert('Error verifying payment')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-[#848d97] text-xl">Loading...</div>
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
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'Unknown'}
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
                            <span className="ml-2 text-[#e6edf3]">{order.formData.productName}</span>
                          </div>
                          <div>
                            <span className="text-[#848d97]">Quantity:</span>
                            <span className="ml-2 text-[#e6edf3]">{order.formData.quantity} comments</span>
                          </div>
                          <div>
                            <span className="text-[#848d97]">Platforms:</span>
                            <span className="ml-2 text-[#e6edf3]">{order.formData.platforms?.join(', ')}</span>
                          </div>
                        </>
                      )}

                      {order.service === 'search' && (
                        <div>
                          <span className="text-[#848d97]">Product:</span>
                          <span className="ml-2 text-[#e6edf3]">{order.formData.productName}</span>
                        </div>
                      )}

                      {order.service === 'influencer' && (
                        <>
                          <div>
                            <span className="text-[#848d97]">Niche:</span>
                            <span className="ml-2 text-[#e6edf3]">{order.formData.niche}</span>
                          </div>
                          <div>
                            <span className="text-[#848d97]">Count:</span>
                            <span className="ml-2 text-[#e6edf3]">{order.formData.numInfluencers}</span>
                          </div>
                        </>
                      )}

                      {order.service === 'review' && (
                        <>
                          <div>
                            <span className="text-[#848d97]">Product:</span>
                            <span className="ml-2 text-[#e6edf3]">{order.formData.productName}</span>
                          </div>
                          <div>
                            <span className="text-[#848d97]">Platform:</span>
                            <span className="ml-2 text-[#e6edf3]">{order.formData.platform}</span>
                          </div>
                        </>
                      )}

                      {order.service === 'humanization' && (
                        <>
                          <div>
                            <span className="text-[#848d97]">Words:</span>
                            <span className="ml-2 text-[#e6edf3]">{order.formData.wordCount}</span>
                          </div>
                          <div>
                            <span className="text-[#848d97]">File:</span>
                            <span className="ml-2 text-[#e6edf3]">{order.formData.file?.name || 'Uploaded'}</span>
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

      {/* Footer */}
      <div className="border-t border-[#30363d] mt-12">
        <div className="px-8 py-4 text-center text-xs text-[#848d97]">
          Baruch Hashem Adonai
        </div>
      </div>
    </div>
  )
}