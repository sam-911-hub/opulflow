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

    // Check Mailjet configuration
    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
      console.error('Contact API: Mailjet API keys not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    // Get inquiry type name
    const getInquiryTypeName = (type: string) => {
      switch (type) {
        case 'inquiry': return 'General Inquiry'
        case 'complaint': return 'Complaint'
        case 'suggestion': return 'Suggestion'
        case 'technical': return 'Technical Support'
        case 'billing': return 'Billing Question'
        default: return type
      }
    }

    // Prepare email content
    const emailContent = `
New Customer Service Inquiry

From: ${name} <${email}>
Type: ${getInquiryTypeName(type)}
Subject: ${subject}

Message:
${message}

---
Sent via OpulFlow Customer Service Form
Timestamp: ${new Date().toISOString()}
    `.trim()

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
                Name: 'OpulFlow Support'
              }
            ],
            Subject: `[${type.toUpperCase()}] ${subject}`,
            TextPart: emailContent,
            HTMLPart: `
              <h2>New Customer Service Inquiry</h2>
              <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
              <p><strong>Type:</strong> ${getInquiryTypeName(type)}</p>
              <p><strong>Subject:</strong> ${subject}</p>

              <h3>Message:</h3>
              <div style="background: #f6f8fa; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</div>

              <hr style="margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px;">Sent via OpulFlow Customer Service Form<br>Timestamp: ${new Date().toISOString()}</p>
            `
          }
        ]
      }),
    })

    if (!mailjetResponse.ok) {
      const errorData = await mailjetResponse.text()
      console.error('Mailjet contact error:', errorData)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    const mailjetData = await mailjetResponse.json()
    console.log('Contact email sent successfully:', mailjetData)

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