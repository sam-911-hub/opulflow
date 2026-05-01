import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, type, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !type || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Prepare email content
    const emailContent = `
New Customer Service Inquiry

From: ${name} <${email}>
Type: ${type}
Subject: ${subject}

Message:
${message}

---
Sent via OpulFlow Customer Service Form
Timestamp: ${new Date().toISOString()}
    `.trim()

    // Here you would integrate with an email service
    // For now, we'll log it and return success
    console.log('Customer Service Email:', {
      to: 'opulflow.inc@gmail.com',
      subject: `[${type.toUpperCase()}] ${subject}`,
      content: emailContent
    })

    // In production, you would send the actual email
    // Example with a service like SendGrid, Mailgun, or similar:
    /*
    const response = await fetch('your-email-service-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`
      },
      body: JSON.stringify({
        to: 'opulflow.inc@gmail.com',
        subject: `[${type.toUpperCase()}] ${subject}`,
        text: emailContent,
        from: email
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }
    */

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}