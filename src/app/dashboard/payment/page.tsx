"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface OrderData {
  service: string
  userEmail: string
  formData: any
  totalCost: number
  timestamp: string
}

export default function PaymentPage() {
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const pendingOrder = localStorage.getItem('pendingOrder')
    if (pendingOrder) {
      setOrderData(JSON.parse(pendingOrder))
    } else {
      router.push('/dashboard')
    }
  }, [router])

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

  const handlePayment = async () => {
    if (!paymentMethod || !orderData) {
      alert('Please select a payment method')
      return
    }

    setLoading(true)

    try {
      // Send email notification
      const emailResponse = await fetch('/api/send-order-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: orderData.service,
          userEmail: orderData.userEmail,
          formData: orderData.formData,
          totalCost: orderData.totalCost,
          paymentMethod,
          timestamp: orderData.timestamp
        }),
      })

      if (!emailResponse.ok) {
        throw new Error('Failed to send order notification')
      }

      // Save order to Firestore
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: orderData.service,
          formData: orderData.formData,
          totalCost: orderData.totalCost,
          paymentMethod,
          status: 'pending'
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      // Clear pending order
      localStorage.removeItem('pendingOrder')

      // Redirect to success page or orders
      alert('Order submitted successfully! We will process your request and send updates to your email.')
      router.push('/dashboard')

    } catch (error) {
      console.error('Payment error:', error)
      alert('There was an error processing your order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!orderData) {
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
            <h1 className="text-xl font-semibold text-[#e6edf3]">Complete Your Order</h1>
            <Link href="/" className="text-[#2f81f7] hover:text-[#79c0ff] text-sm">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Order Summary */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-[#848d97]">Service:</span>
                <span className="font-medium text-[#e6edf3]">{getServiceName(orderData.service)}</span>
              </div>

              {orderData.service === 'comment' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#848d97]">Product:</span>
                    <span className="font-medium text-[#e6edf3]">{orderData.formData.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848d97]">Quantity:</span>
                    <span className="font-medium text-[#e6edf3]">{orderData.formData.quantity} comments</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848d97]">Platforms:</span>
                    <span className="font-medium text-[#e6edf3]">{orderData.formData.platforms?.join(', ') || 'All platforms'}</span>
                  </div>
                </>
              )}

              {orderData.service === 'search' && (
                <div className="flex justify-between">
                  <span className="text-[#848d97]">Product:</span>
                  <span className="font-medium text-[#e6edf3]">{orderData.formData.productName}</span>
                </div>
              )}

              {orderData.service === 'influencer' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#848d97]">Niche:</span>
                    <span className="font-medium text-[#e6edf3]">{orderData.formData.niche}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848d97]">Number of Influencers:</span>
                    <span className="font-medium text-[#e6edf3]">{orderData.formData.numInfluencers}</span>
                  </div>
                </>
              )}

              {orderData.service === 'review' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#848d97]">Product:</span>
                    <span className="font-medium text-[#e6edf3]">{orderData.formData.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848d97]">Platform:</span>
                    <span className="font-medium text-[#e6edf3]">{orderData.formData.platform}</span>
                  </div>
                </>
              )}

              {orderData.service === 'humanization' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#848d97]">Word Count:</span>
                    <span className="font-medium text-[#e6edf3]">{orderData.formData.wordCount} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848d97]">File:</span>
                    <span className="font-medium text-[#e6edf3]">{orderData.formData.file?.name || 'Uploaded file'}</span>
                  </div>
                </>
              )}

              <hr className="border-[#30363d]" />

              <div className="flex justify-between text-lg font-semibold">
                <span className="text-[#e6edf3]">Total Amount:</span>
                <span className="text-[#e6edf3]">${orderData.totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">Select Payment Method</h2>

            <div className="space-y-4">
              <label className="flex items-center p-4 border border-[#30363d] rounded-md cursor-pointer hover:bg-[#21262d] transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#0070ba] rounded mr-3 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">P</span>
                  </div>
                  <div>
                    <div className="font-medium text-[#e6edf3]">PayPal</div>
                    <div className="text-sm text-[#848d97]">Pay with PayPal account or credit card</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 border border-[#30363d] rounded-md cursor-pointer hover:bg-[#21262d] transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="mpesa"
                  checked={paymentMethod === 'mpesa'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#1f7e1f] rounded mr-3 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">M</span>
                  </div>
                  <div>
                    <div className="font-medium text-[#e6edf3]">M-Pesa</div>
                    <div className="text-sm text-[#848d97]">Pay with M-Pesa mobile money</div>
                  </div>
                </div>
              </label>
            </div>

            <div className="mt-4 p-4 bg-[#bb8009] border border-[#d29922] rounded-md">
              <p className="text-sm text-white">
                <strong>Note:</strong> This is a demo implementation. In production, you would integrate with actual PayPal and M-Pesa APIs for secure payment processing.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handlePayment}
              disabled={loading || !paymentMethod}
              className="flex-1 bg-[#238636] hover:bg-[#2ea043] text-white py-3 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Processing...' : `Pay $${orderData.totalCost.toFixed(2)} & Submit Order`}
            </button>

            <Link
              href="/dashboard"
              className="px-6 py-3 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] rounded-md transition-colors font-medium"
            >
              Cancel
            </Link>
          </div>
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