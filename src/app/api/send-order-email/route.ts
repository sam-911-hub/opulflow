import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin'
import { getFirebaseAdminDb } from '@/lib/firebaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { service, userEmail, formData, totalCost, paymentMethod, timestamp, orderId, mpesaCode, paypalTransactionId } = body

    // Validate required fields
    if (!service || totalCost === undefined || totalCost === null || !paymentMethod) {
      console.error('Email API: Missing required fields', { service, userEmail, totalCost, paymentMethod })
      return NextResponse.json({
        error: 'Missing required fields',
        details: { service: !!service, userEmail: !!userEmail, totalCost: totalCost !== undefined, paymentMethod: !!paymentMethod }
      }, { status: 400 })
    }

    // If userEmail not provided, get from session
    if (!userEmail) {
      const session = request.cookies.get('session')
      if (session?.value) {
        try {
          const decodedToken = await getFirebaseAdminAuth().verifyIdToken(session.value)
          const userId = decodedToken.uid
          const db = getFirebaseAdminDb()
          const userDoc = await db.collection('users').doc(userId).get()
          if (userDoc.exists) {
            const userData = userDoc.data()
            userEmail = userData?.email || decodedToken.email
          } else {
            userEmail = decodedToken.email
          }
        } catch (authError) {
          console.error('Email API: Failed to get userEmail from session:', authError)
          return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }
      } else {
        console.error('Email API: No userEmail and no session')
        return NextResponse.json({ error: 'User email required' }, { status: 400 })
      }
    }

    // Check Mailjet configuration
    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
      console.error('Email API: Mailjet API keys not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    // Get service name
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

    // Create detailed order information
    const orderDetails = {
      orderId: orderId || 'N/A',
      service: getServiceName(service),
      userEmail,
      paymentMethod: paymentMethod.toUpperCase(),
      totalCost: `$${totalCost.toFixed(2)}`,
      timestamp: new Date(timestamp).toLocaleString(),
      paymentConfirmation: paymentMethod === 'paypal' && paypalTransactionId ? `PayPal Transaction ID: ${paypalTransactionId}` :
                           paymentMethod === 'mpesa' && mpesaCode ? `M-PESA Code: ${mpesaCode}` : 'Pending verification',
      details: formData
    }

    // Format email content
    const emailContent = `
New OpulFlow Order Received!

Order ID: ${orderDetails.orderId}
Service: ${orderDetails.service}
Customer Email: ${orderDetails.userEmail}
Payment Method: ${orderDetails.paymentMethod}
Total Amount: ${orderDetails.totalCost}
Order Date: ${orderDetails.timestamp}
Payment Confirmation: ${orderDetails.paymentConfirmation}

Order Details:
${JSON.stringify(orderDetails.details, null, 2)}

Please process this order promptly and update the customer on progress.
`

    // Send email using Mailjet
    const mailjetResponse = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: process.env.FROM_EMAIL || 'opulflow.inc@gmail.com',
              Name: 'OpulFlow'
            },
            To: [
              {
                Email: 'opulflow.inc@gmail.com',
                Name: 'OpulFlow Admin'
              }
            ],
            Subject: `New ${orderDetails.service} Order - ${orderDetails.orderId} - $${totalCost.toFixed(2)}`,
            TextPart: emailContent,
            HTMLPart: `
              <h2>New OpulFlow Order Received!</h2>
              <p><strong>Order ID:</strong> <code style="background: #f6f8fa; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${orderDetails.orderId}</code></p>
              <p><strong>Service:</strong> ${orderDetails.service}</p>
              <p><strong>Customer Email:</strong> ${orderDetails.userEmail}</p>
              <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
              <p><strong>Total Amount:</strong> ${orderDetails.totalCost}</p>
              <p><strong>Order Date:</strong> ${orderDetails.timestamp}</p>
              <p><strong>Payment Confirmation:</strong> <code style="background: #fef3c7; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${orderDetails.paymentConfirmation}</code></p>

              <h3>Order Details:</h3>
              <pre style="background: #f6f8fa; padding: 15px; border-radius: 5px; overflow-x: auto;">${JSON.stringify(orderDetails.details, null, 2)}</pre>

              <p><em>Please process this order promptly and update the customer on progress.</em></p>
            `
          }
        ]
      }),
    })

    if (!mailjetResponse.ok) {
      const errorData = await mailjetResponse.text()
      console.error('Mailjet error:', errorData)
      return NextResponse.json({ error: 'Failed to send email notification' }, { status: 500 })
    }

    const mailjetData = await mailjetResponse.json()
    console.log('Email sent successfully:', mailjetData)

    return NextResponse.json({
      success: true,
      message: 'Order notification sent successfully'
    })

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}