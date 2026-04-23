"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

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

  const handlePayment = async (paymentMethod: string = 'paypal') => {
    if (!orderData) {
      alert('Order data not found')
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
          status: 'paid'
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      // Clear pending order
      localStorage.removeItem('pendingOrder')

      // Redirect to success page or orders
      alert('Payment successful! Order submitted and we will process your request. Check your email for updates.')
      router.push('/dashboard')

    } catch (error) {
      console.error('Payment error:', error)
      alert('There was an error processing your order. Please contact support.')
    } finally {
      setLoading(false)
    }
  }

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test"

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-[#848d97] text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <PayPalScriptProvider options={{
      clientId: paypalClientId,
      currency: "USD",
      intent: "capture"
    }}>
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

          {/* PayPal Payment */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">Complete Payment</h2>

            <div className="mb-4">
              <div className="flex items-center justify-between p-4 bg-[#21262d] rounded-md">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#0070ba] rounded mr-3 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">P</span>
                  </div>
                  <div>
                    <div className="font-medium text-[#e6edf3]">PayPal</div>
                    <div className="text-sm text-[#848d97]">Secure payment via PayPal</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-[#e6edf3]">${orderData.totalCost.toFixed(2)}</div>
                  <div className="text-sm text-[#848d97]">USD</div>
                </div>
              </div>
            </div>

            <PayPalButtons
              style={{
                layout: "vertical",
                color: "blue",
                shape: "rect",
                label: "paypal"
              }}
              createOrder={async (data, actions) => {
                try {
                  const paypalResponse = await fetch('/api/paypal/create-order', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      amount: orderData!.totalCost,
                      currency: 'USD',
                      description: `${getServiceName(orderData!.service)} - Order for ${orderData!.userEmail}`
                    })
                  })

                  if (!paypalResponse.ok) {
                    throw new Error('Failed to create order')
                  }

                  const paypalOrderData = await paypalResponse.json()
                  return paypalOrderData.orderId
                } catch (error) {
                  console.error('Order creation error:', error)
                  throw error
                }
              }}
              onApprove={async (data, actions) => {
                try {
                  // Capture the order on the client side
                  const details = await actions.order?.capture()
                  if (details?.status === 'COMPLETED') {
                    // Payment successful, process order
                    await handlePayment('paypal')
                  } else {
                    alert('Payment not completed. Please try again.')
                  }
                } catch (error) {
                  console.error('PayPal capture error:', error)
                  alert('Payment failed. Please try again.')
                }
              }}
              onError={(error) => {
                console.error('PayPal error:', error)
                alert('Payment failed. Please try again.')
              }}
            />

            <div className="mt-4 p-4 bg-[#30363d] border border-[#484f58] rounded-md">
              <p className="text-sm text-[#848d97]">
                <strong>Secure Payment:</strong> Your payment is processed securely through PayPal. Funds will be sent to samuelomondi288@gmail.com.
              </p>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="text-center">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] rounded-md transition-colors font-medium inline-block"
            >
              Cancel Order
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
    </PayPalScriptProvider>
  )
}