import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { service, userEmail, formData, totalCost, paymentMethod, timestamp } = body

    if (!service || !userEmail || !totalCost || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
      service: getServiceName(service),
      userEmail,
      paymentMethod: paymentMethod.toUpperCase(),
      totalCost: `$${totalCost.toFixed(2)}`,
      timestamp: new Date(timestamp).toLocaleString(),
      details: formData
    }

    // Format email content
    const emailContent = `
New OpulFlow Order Received!

Service: ${orderDetails.service}
Customer Email: ${orderDetails.userEmail}
Payment Method: ${orderDetails.paymentMethod}
Total Amount: ${orderDetails.totalCost}
Order Date: ${orderDetails.timestamp}

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
            Subject: `New ${orderDetails.service} Order - $${totalCost.toFixed(2)}`,
            TextPart: emailContent,
            HTMLPart: `
              <h2>New OpulFlow Order Received!</h2>
              <p><strong>Service:</strong> ${orderDetails.service}</p>
              <p><strong>Customer Email:</strong> ${orderDetails.userEmail}</p>
              <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
              <p><strong>Total Amount:</strong> ${orderDetails.totalCost}</p>
              <p><strong>Order Date:</strong> ${orderDetails.timestamp}</p>

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