"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/ui/toast"
import ErrorBoundary from "@/components/ErrorBoundary"
import { createOrderFallback, retryWithBackoff } from "@/lib/orderFallback"

interface OrderData {
  service: string
  userEmail: string
  formData: any
  totalCost: number
  timestamp: string
  orderId?: string
}

export default function PaymentPage() {
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'paypal' | 'mpesa'>('paypal')
  const [mpesaCode, setMpesaCode] = useState('')
  const [paypalTransactionId, setPaypalTransactionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      const pendingOrder = localStorage.getItem('pendingOrder')
      if (pendingOrder) {
        const order = JSON.parse(pendingOrder)
        setOrderData(order)
      } else {
        toast.error('No order found. Please create an order first.')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error loading order data:', error)
      setPageError('Failed to load order information. Please try again.')
      toast.error('Failed to load order information')
    }
  }, [router])

  // Auto-process free orders
  useEffect(() => {
    if (orderData && orderData.totalCost === 0 && !loading) {
      handlePaymentConfirmation('free')
    }
  }, [orderData])

  const handlePaymentConfirmation = async (paymentMethod: string, confirmationCode?: string) => {
    if (!orderData) {
      toast.error('Order data not found. Please try placing your order again.')
      router.push('/dashboard')
      return
    }

    setLoading(true)

    try {
      const orderId = orderData.orderId || `OPF-${Date.now()}`

      // For free services, skip payment verification and mark as paid directly
      const isFreeService = orderData.totalCost === 0
      const orderStatus = isFreeService ? 'paid' : 'pending_verification'

      // Send email notification (non-blocking)
      try {
        const emailResponse = await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: orderData.service,
            userEmail: orderData.userEmail,
            formData: orderData.formData,
            totalCost: orderData.totalCost,
            paymentMethod,
            mpesaCode: paymentMethod === 'mpesa' ? confirmationCode : undefined,
            paypalTransactionId: paymentMethod === 'paypal' ? paypalTransactionId : undefined,
            timestamp: orderData.timestamp,
            orderId: orderId
          }),
        })

        if (!emailResponse.ok) {
          // Email failed, but continue silently
        } else {
          console.log('Order notification email sent successfully')
        }
      } catch (emailError) {
        // Email sending failed, continue silently
      }

      // Save order to Firestore via API with fallback
      let orderCreated = false;
      let finalOrderId = orderId;

      try {
        const orderResponse = await retryWithBackoff(
          () => fetch('/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service: orderData.service,
              formData: orderData.formData,
              totalCost: orderData.totalCost,
              paymentMethod: isFreeService ? 'free' : paymentMethod,
              mpesaCode: confirmationCode,
              status: orderStatus,
              orderId
            }),
          }),
          2, // 2 attempts
          1000 // 1 second initial delay
        );

        if (orderResponse.ok) {
          console.log('✅ Order created via API');
          orderCreated = true;
        } else {
          // Treat any non-ok response as needing fallback (including 404, 500, etc.)
          console.warn(`Order API failed with status ${orderResponse.status}. Attempting client-side fallback...`);
          // Try client-side fallback for any API failure
          try {
            const fallbackResult = await createOrderFallback({
              service: orderData.service,
              formData: orderData.formData,
              totalCost: orderData.totalCost,
              paymentMethod: isFreeService ? 'free' : paymentMethod,
              mpesaCode: confirmationCode,
              status: orderStatus,
              orderId,
              userEmail: orderData.userEmail,
            });
            finalOrderId = fallbackResult.orderId;
            orderCreated = true;
            toast.info('Order recorded via offline mode. Our team will process it shortly.');
          } catch (fallbackError) {
            console.error('Fallback order creation failed:', fallbackError);

            // If it's an offline/network error, still consider the order successful
            // since the data is saved in localStorage
            if (fallbackError.message?.includes('offline') || fallbackError.message?.includes('network') ||
                fallbackError.message?.includes('Failed to get document')) {
              console.log('Order data is safely stored locally. Will sync when connection returns.');
              orderCreated = true;
              toast.info('Order saved locally due to offline status. Our team will process it when connection is restored.');
            } else {
              toast.warning('Order may not have been recorded. Please contact support if needed.');
            }
          }
        }
      } catch (apiError) {
        console.error('Order creation API error:', apiError);
        // Try client-side fallback on any network error
        try {
          const fallbackResult = await createOrderFallback({
            service: orderData.service,
            formData: orderData.formData,
            totalCost: orderData.totalCost,
            paymentMethod: isFreeService ? 'free' : paymentMethod,
            mpesaCode: confirmationCode,
            status: orderStatus,
            orderId,
            userEmail: orderData.userEmail,
          });
          finalOrderId = fallbackResult.orderId;
          orderCreated = true;
          toast.info('Order recorded locally. Processing may take longer than usual.');
        } catch (fallbackError) {
          console.error('Fallback failed:', fallbackError);

          // Handle offline/network errors gracefully
          if (fallbackError.message?.includes('offline') || fallbackError.message?.includes('network') ||
              fallbackError.message?.includes('Failed to get document')) {
            console.log('Order data is safely stored locally due to offline status.');
            orderCreated = true;
            toast.info('Order saved locally due to offline status. Our team will process it when connection is restored.');
          } else {
            // For other types of errors, save to failed orders for manual recovery
            const failedOrder = {
              ...orderData,
              orderId,
              paymentMethod: isFreeService ? 'free' : paymentMethod,
              status: orderStatus,
              mpesaCode: confirmationCode,
              createdAt: new Date().toISOString(),
              failedToSync: true,
            };
            const failedOrders = JSON.parse(localStorage.getItem('failedOrders') || '[]');
            failedOrders.push(failedOrder);
            localStorage.setItem('failedOrders', JSON.stringify(failedOrders));

            toast.warning('Order saved locally for manual processing. Our team will contact you shortly.');
            orderCreated = true; // Still consider it created for UX purposes
          }
        }
      }

      localStorage.removeItem('pendingOrder')

      if (isFreeService) {
        toast.success('Order placed successfully! Your free product search will be processed soon.')
      } else {
        toast.success('Payment recorded! We\'ll verify within 2 hours and email you when work begins.')
      }

      router.push('/dashboard')

    } catch (error) {
      console.error('Payment confirmation error:', error)
      toast.error('Payment confirmation failed. Our team has been notified. Please contact support if the issue persists.')
    } finally {
      setLoading(false)
      setShowModal(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const orderId = orderData?.orderId || `OPF-${Date.now()}`
  const usdToKesRate = 130
  const kesAmount = Math.round((orderData?.totalCost || 0) * usdToKesRate)

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

  if (pageError) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#e6edf3] mb-4">Error Loading Page</h2>
          <p className="text-[#848d97] mb-6">{pageError}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#238636] hover:bg-[#2ea043] text-white py-2 px-6 rounded-md transition-colors font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-[#848d97] text-xl">Loading...</div>
      </div>
    )
  }

  // For free services, show processing message
  if (orderData.totalCost === 0) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-[#238636] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#e6edf3] mb-4">Processing Free Order</h1>
          <p className="text-[#848d97] mb-6">
            Your free product search is being processed. You'll receive the results soon!
          </p>
          <div className="text-sm text-[#848d97]">
            Redirecting to dashboard...
          </div>
        </div>
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
        <div className="max-w-4xl mx-auto">
          {/* Order Summary */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-[#848d97]">Service:</span>
                <span className="font-medium text-[#e6edf3]">{getServiceName(orderData.service)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-[#e6edf3]">Total Amount:</span>
                <span className="text-[#e6edf3]">${orderData.totalCost.toFixed(2)} USD</span>
              </div>
              <div className="text-sm text-[#848d97]">
                ≈ KES {kesAmount.toLocaleString()} (exchange rate: ~${usdToKesRate}/USD)
              </div>
            </div>
            <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[#848d97]">Order ID</div>
                  <div className="font-mono text-[#e6edf3] text-lg">{orderId}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(orderId)}
                  className="px-3 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] rounded-md text-sm transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* PayPal Option */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-[#0070ba] rounded mr-3 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <h3 className="text-lg font-semibold text-[#e6edf3]">PayPal</h3>
              </div>
              <div className="space-y-3 mb-6">
                <div className="text-sm text-[#848d97]">
                  Send payment to: <span className="font-mono text-[#e6edf3]">samuelomondi288@gmail.com</span>
                  <button onClick={() => copyToClipboard('samuelomondi288@gmail.com')} className="ml-2 text-[#2f81f7] hover:text-[#79c0ff] text-xs">Copy</button>
                </div>
                <div className="text-sm text-[#848d97]">
                  Please include your Order ID in the payment note field
                </div>
                <div className="bg-[#0d1117] border border-[#30363d] rounded p-3">
                  <div className="text-xs text-[#848d97] mb-1">Order ID for reference:</div>
                  <div className="font-mono text-[#e6edf3]">{orderId}</div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#e6edf3]">PayPal Transaction ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., 8X123456789012345"
                    value={paypalTransactionId}
                    onChange={(e) => setPaypalTransactionId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                  />
                  <div className="text-xs text-[#848d97]">You can find this in your PayPal transaction details</div>
                </div>

                <div className="text-sm text-[#848d97]">
                  Payments verified within 2 hours during working hours (Mon-Sat, 7AM-5PM EAT)
                </div>
              </div>
              <button
                onClick={() => { setModalType('paypal'); setShowModal(true) }}
                className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-3 px-4 rounded-md transition-colors font-medium"
              >
                Mark as Paid
              </button>
            </div>

            {/* M-PESA Option */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-[#1f7e1f] rounded mr-3 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <h3 className="text-lg font-semibold text-[#e6edf3]">M-Pesa</h3>
              </div>
              <div className="space-y-3 mb-6">
                <div className="text-sm text-[#848d97]">Business: <span className="font-medium text-[#e6edf3]">OpulFlow</span></div>
                <div className="text-sm text-[#848d97]">Till Number: <span className="font-mono text-[#e6edf3]">coming soon</span></div>
                <div className="text-sm text-[#848d97]">Amount: <span className="font-medium text-[#e6edf3]">KES {kesAmount.toLocaleString()}</span>
                  <button onClick={() => copyToClipboard(kesAmount.toString())} className="ml-2 text-[#2f81f7] hover:text-[#79c0ff] text-xs">Copy</button>
                </div>
                <div className="text-sm text-[#848d97]">Instructions: Open M-PESA → Lipa Na M-PESA → Buy Goods → Enter Till Number → Enter Amount</div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#e6edf3]">M-PESA Confirmation Code</label>
                  <input
                    type="text"
                    placeholder="e.g., ABC123XYZ"
                    value={mpesaCode}
                    onChange={(e) => setMpesaCode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] focus:border-[#2f81f7]"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  if (!mpesaCode.trim()) {
                    toast.warning('Please enter your M-PESA confirmation code')
                    return
                  }
                  setModalType('mpesa')
                  setShowModal(true)
                }}
                disabled={!mpesaCode.trim()}
                className="w-full bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white py-3 px-4 rounded-md transition-colors font-medium"
              >
                Confirm Payment
              </button>
            </div>
          </div>

          {/* Professional Touches */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4">
              <div className="flex items-center text-[#238636] mb-2">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Payment Guarantee
              </div>
              <div className="text-sm text-[#848d97]">Manual verification within a few minutes. All payments are secure and tracked.</div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4">
              <div className="flex items-center text-[#2f81f7] mb-2">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Working Hours
              </div>
              <div className="text-sm text-[#848d97]">Orders placed outside working hours will be processed next business day.</div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
            <h3 className="text-lg font-semibold text-[#e6edf3] mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <details className="group">
                <summary className="cursor-pointer text-[#e6edf3] font-medium flex items-center">
                  <span className="mr-2 group-open:rotate-90 transition-transform">▶</span>
                  How long does payment verification take?
                </summary>
                <div className="mt-2 text-sm text-[#848d97] ml-6">
                  During working hours (Mon-Sat, 7AM-5PM EAT), payments are verified within 2 hours.
                  Outside these hours, verification occurs the next business day.
                </div>
              </details>
              <details className="group">
                <summary className="cursor-pointer text-[#e6edf3] font-medium flex items-center">
                  <span className="mr-2 group-open:rotate-90 transition-transform">▶</span>
                  What happens after I make payment?
                </summary>
                <div className="mt-2 text-sm text-[#848d97] ml-6">
                  Once verified, you'll receive an email confirmation and your order will be queued for processing.
                  Our team will begin work according to your specified requirements.
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>



      {/* Payment Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-md w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#e6edf3] mb-4">
                Confirm {modalType === 'paypal' ? 'PayPal' : 'M-PESA'} Payment
              </h3>
              {modalType === 'paypal' ? (
                <div className="space-y-4">
                  <div className="text-[#848d97]">Have you sent the payment to <span className="font-mono text-[#e6edf3]">samuelomondi288@gmail.com</span>?</div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded p-3">
                    <div className="text-xs text-[#848d97] mb-1">Order ID:</div>
                    <div className="font-mono text-[#e6edf3]">{orderId}</div>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded p-3">
                    <div className="text-xs text-[#848d97] mb-1">Amount:</div>
                    <div className="text-[#e6edf3]">${orderData.totalCost.toFixed(2)} USD</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-[#848d97]">Please confirm your M-PESA payment details:</div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded p-3">
                    <div className="text-xs text-[#848d97] mb-1">Order ID:</div>
                    <div className="font-mono text-[#e6edf3]">{orderId}</div>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded p-3">
                    <div className="text-xs text-[#848d97] mb-1">Amount:</div>
                    <div className="text-[#e6edf3]">KES {kesAmount.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded p-3">
                    <div className="text-xs text-[#848d97] mb-1">Confirmation Code:</div>
                    <div className="font-mono text-[#e6edf3]">{mpesaCode}</div>
                  </div>
                </div>
              )}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handlePaymentConfirmation(modalType, modalType === 'mpesa' ? mpesaCode : undefined)}
                  disabled={loading}
                  className="flex-1 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white py-2 px-4 rounded-md transition-colors font-medium"
                >
                  {loading ? 'Processing...' : `Yes, I've ${modalType === 'paypal' ? 'Paid' : 'Confirmed'}`}
                </button>
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] rounded-md transition-colors">
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