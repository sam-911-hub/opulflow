import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.MAILJET_API_KEY;
    const secretKey = process.env.MAILJET_SECRET_KEY;
    const adminEmail = process.env.FROM_EMAIL || 'opulflow.inc@gmail.com';

    if (!apiKey || !secretKey) {
      console.error('Mailjet credentials not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { orderId, userEmail, productName, platforms, quantity, tone, instructions, totalCost, status, createdAt } = body;

    const emailContent = `
New Order Received!

=== ORDER DETAILS ===
Order ID: ${orderId}
Status: ${status}
Date: ${createdAt}

=== CUSTOMER ===
Email: ${userEmail}

=== ORDER INFO ===
Product/Service: ${productName}
Target Platforms: ${platforms.join(', ')}
Quantity: ${quantity} comments
Tone: ${tone}
${instructions ? `Special Instructions: ${instructions}` : ''}

=== COST ===
Total Cost: ${totalCost} credits

---
OpulFlow Order System
    `.trim();

    const mailjetData = {
      Messages: [
        {
          From: {
            Email: adminEmail,
            Name: 'OpulFlow Orders',
          },
          To: [
            {
              Email: adminEmail,
              Name: 'Admin',
            },
          ],
          Subject: `New Order ${orderId} - ${productName}`,
          TextPart: emailContent,
        },
      ],
    };

    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString('base64')}`,
      },
      body: JSON.stringify(mailjetData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mailjet error:', errorData);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return NextResponse.json({ success: true, message: 'Email sent' });
  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}