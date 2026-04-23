import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdminDb } from '@/lib/firebaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_type, resource } = body

    // Handle PayPal payment capture completed
    if (event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const paypalOrderId = resource.supplementary_data?.related_ids?.order_id
      const amount = resource.amount?.value
      const currency = resource.amount?.currency_code

      if (!paypalOrderId || !amount) {
        return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
      }

      // Find order by PayPal order ID or update based on amount/timestamp
      const db = getFirebaseAdminDb()
      const ordersRef = db.collection('orders')

      // You might want to store PayPal order ID when creating orders
      // For now, we'll update orders based on recent orders with matching amount
      const recentOrders = await ordersRef
        .where('totalCost', '==', parseFloat(amount))
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get()

      if (!recentOrders.empty) {
        const orderDoc = recentOrders.docs[0]
        await orderDoc.ref.update({
          status: 'paid',
          paypalOrderId,
          paymentConfirmedAt: new Date(),
          paymentDetails: {
            amount,
            currency,
            paypalOrderId
          }
        })

        console.log(`Order ${orderDoc.id} marked as paid via PayPal webhook`)
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}