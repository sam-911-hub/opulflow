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
      router.push('/dashboard/orders')

    } catch (error) {
      console.error('Payment error:', error)
      alert('There was an error processing your order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!orderData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#656d76] text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#24292F]">Complete Your Order</h1>
        <Link href="/" className="text-[#0969DA] hover:text-[#0757c2] text-sm">
          ← Back to Homepage
        </Link>
      </div>

      {/* Order Summary */}
      <div className="bg-white border border-[#d1d9e0] rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#24292F] mb-4">Order Summary</h2>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between">
            <span className="text-[#656d76]">Service:</span>
            <span className="font-medium text-[#24292F]">{getServiceName(orderData.service)}</span>
          </div>

          {orderData.service === 'comment' && (
            <>
              <div className="flex justify-between">
                <span className="text-[#656d76]">Product:</span>
                <span className="font-medium text-[#24292F]">{orderData.formData.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#656d76]">Quantity:</span>
                <span className="font-medium text-[#24292F]">{orderData.formData.quantity} comments</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#656d76]">Platforms:</span>
                <span className="font-medium text-[#24292F]">{orderData.formData.platforms?.join(', ') || 'All platforms'}</span>
              </div>
            </>
          )}

          {orderData.service === 'search' && (
            <div className="flex justify-between">
              <span className="text-[#656d76]">Product:</span>
              <span className="font-medium text-[#24292F]">{orderData.formData.productName}</span>
            </div>
          )}

          {orderData.service === 'influencer' && (
            <>
              <div className="flex justify-between">
                <span className="text-[#656d76]">Niche:</span>
                <span className="font-medium text-[#24292F]">{orderData.formData.niche}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#656d76]">Number of Influencers:</span>
                <span className="font-medium text-[#24292F]">{orderData.formData.numInfluencers}</span>
              </div>
            </>
          )}

          {orderData.service === 'review' && (
            <>
              <div className="flex justify-between">
                <span className="text-[#656d76]">Product:</span>
                <span className="font-medium text-[#24292F]">{orderData.formData.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#656d76]">Platform:</span>
                <span className="font-medium text-[#24292F]">{orderData.formData.platform}</span>
              </div>
            </>
          )}

          {orderData.service === 'humanization' && (
            <>
              <div className="flex justify-between">
                <span className="text-[#656d76]">Word Count:</span>
                <span className="font-medium text-[#24292F]">{orderData.formData.wordCount} words</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#656d76]">File:</span>
                <span className="font-medium text-[#24292F]">{orderData.formData.file?.name || 'Uploaded file'}</span>
              </div>
            </>
          )}

          <hr className="border-[#d1d9e0]" />

          <div className="flex justify-between text-lg font-semibold">
            <span className="text-[#24292F]">Total Amount:</span>
            <span className="text-[#24292F]">${orderData.totalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white border border-[#d1d9e0] rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#24292F] mb-4">Select Payment Method</h2>

        <div className="space-y-4">
          <label className="flex items-center p-4 border border-[#d1d9e0] rounded-lg cursor-pointer hover:bg-[#f6f8fa]">
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
                <div className="font-medium text-[#24292F]">PayPal</div>
                <div className="text-sm text-[#656d76]">Pay with PayPal account or credit card</div>
              </div>
            </div>
          </label>

          <label className="flex items-center p-4 border border-[#d1d9e0] rounded-lg cursor-pointer hover:bg-[#f6f8fa]">
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
                <div className="font-medium text-[#24292F]">M-Pesa</div>
                <div className="text-sm text-[#656d76]">Pay with M-Pesa mobile money</div>
              </div>
            </div>
          </label>
        </div>

        <div className="mt-4 p-4 bg-[#fef3c7] border border-[#f59e0b] rounded-md">
          <p className="text-sm text-[#92400e]">
            <strong>Note:</strong> This is a demo implementation. In production, you would integrate with actual PayPal and M-Pesa APIs for secure payment processing.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handlePayment}
          disabled={loading || !paymentMethod}
          className="flex-1 bg-[#24292F] text-white py-3 px-6 rounded-md hover:bg-[#1b1f23] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Processing...' : `Pay $${orderData.totalCost.toFixed(2)} & Submit Order`}
        </button>

        <Link
          href="/dashboard"
          className="px-6 py-3 border border-[#d1d9e0] text-[#24292F] rounded-md hover:bg-[#f6f8fa] transition-colors font-medium"
        >
          Cancel
        </Link>
      </div>
    </div>
  )
}