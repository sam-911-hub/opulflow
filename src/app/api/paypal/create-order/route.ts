import { NextRequest, NextResponse } from 'next/server'
import { getUserFriendlyErrorMessage } from '@/lib/errorMessages'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = 'USD', description } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // PayPal API credentials
    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'PayPal configuration missing' }, { status: 500 })
    }

    // Get PayPal access token (use sandbox for testing, production for live)
    const isProduction = process.env.NODE_ENV === 'production'
    const paypalBaseUrl = isProduction ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'

    const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    })

    if (!authResponse.ok) {
      throw new Error('Failed to get PayPal access token')
    }

    const authData = await authResponse.json()
    const accessToken = authData.access_token

    // Create PayPal order
    const orderResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toFixed(2)
          },
          description: description || 'OpulFlow Service Order',
          payee: {
            email_address: 'samuelomondi288@gmail.com'
          }
        }],
        application_context: {
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment/cancel`
        }
      })
    })

    if (!orderResponse.ok) {
      const errorData = await orderResponse.text()
      console.error('PayPal order creation error:', errorData)
      throw new Error('Failed to create PayPal order')
    }

    const orderData = await orderResponse.json()

    return NextResponse.json({
      orderId: orderData.id,
      approveUrl: orderData.links.find((link: any) => link.rel === 'approve')?.href
    })

  } catch (error) {
    console.error('PayPal order creation error:', error)
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    return NextResponse.json({ error: friendlyMessage }, { status: 500 })
  }
}