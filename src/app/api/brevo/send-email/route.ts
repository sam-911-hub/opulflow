import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';
import { rateLimitMiddleware, trackApiCost } from '@/app/api/middleware-rate-limit';
import { validateEmail, validateName, sanitizeString } from '@/lib/validation';

const BREVO_API_KEY = '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';
const BREVO_BASE_URL = 'https://api.brevo.com/v3';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'email-sender');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;

    // Get request body
    const { 
      to, // array of recipient objects: [{email: 'test@test.com', name: 'Test'}]
      subject,
      htmlContent,
      textContent,
      sender, // {email: 'sender@domain.com', name: 'Sender Name'}
      replyTo,
      cc,
      bcc,
      attachment,
      tags,
      templateId,
      params,
      headers,
      priority
    } = await request.json();

    // Validate inputs
    if (!to || !Array.isArray(to) || to.length === 0) {
      return NextResponse.json({ 
        error: 'Recipients are required and must be an array' 
      }, { status: 400 });
    }

    if (!subject && !templateId) {
      return NextResponse.json({ 
        error: 'Subject is required when not using a template' 
      }, { status: 400 });
    }

    if (!htmlContent && !textContent && !templateId) {
      return NextResponse.json({ 
        error: 'Email content (HTML or text) is required when not using a template' 
      }, { status: 400 });
    }

    // Validate all recipient emails
    const validatedRecipients = [];
    for (const recipient of to) {
      const emailValidation = validateEmail(recipient.email);
      if (!emailValidation.isValid) {
        return NextResponse.json({ 
          error: `Invalid recipient email: ${recipient.email}`,
          details: emailValidation.errors 
        }, { status: 400 });
      }
      
      validatedRecipients.push({
        email: emailValidation.sanitized,
        name: recipient.name ? sanitizeString(recipient.name, 100) : undefined
      });
    }

    // Check user credits
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const emailCredits = userData?.credits?.email_delivery || 0;

    const emailCount = validatedRecipients.length;
    const creditsNeeded = emailCount * 1; // 1 credit per email

    if (emailCredits < creditsNeeded) {
      return NextResponse.json({ 
        error: `Insufficient credits. Email delivery requires ${creditsNeeded} credits ($${(creditsNeeded * 0.02).toFixed(2)})` 
      }, { status: 402 });
    }

    // Prepare Brevo API request
    const brevoPayload: any = {
      to: validatedRecipients,
      subject: subject ? sanitizeString(subject, 200) : undefined,
      htmlContent: htmlContent ? sanitizeString(htmlContent, 50000) : undefined,
      textContent: textContent ? sanitizeString(textContent, 50000) : undefined,
      sender: sender || { email: 'noreply@opulflow.com', name: 'OpulFlow' },
      replyTo,
      cc,
      bcc,
      attachment,
      tags: tags ? tags.map(tag => sanitizeString(tag, 50)) : undefined,
      templateId,
      params,
      headers,
      priority: priority || 'normal'
    };

    // Remove undefined fields
    Object.keys(brevoPayload).forEach(key => {
      if (brevoPayload[key] === undefined) {
        delete brevoPayload[key];
      }
    });

    console.log('Sending email via Brevo:', {
      recipients: emailCount,
      subject: subject?.substring(0, 50),
      hasHtml: !!htmlContent,
      hasText: !!textContent,
      templateId
    });

    // Send email via Brevo API
    const brevoResponse = await fetch(`${BREVO_BASE_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify(brevoPayload)
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.text();
      console.error('Brevo API error:', errorData);
      
      // Track failed API cost
      await trackApiCost(userId, 'email_delivery', creditsNeeded * 0.02, false, {
        error: errorData,
        recipients: emailCount
      });

      return NextResponse.json({ 
        error: 'Failed to send email',
        details: errorData,
        service: 'Email Delivery'
      }, { status: 500 });
    }

    const brevoData = await brevoResponse.json();
    console.log('Brevo email sent successfully:', brevoData);

    // Deduct credits
    await userRef.update({
      'credits.email_delivery': emailCredits - creditsNeeded
    });

    // Log transaction
    await db.collection(`users/${userId}/transactions`).add({
      type: 'usage',
      service: 'email_delivery',
      amount: creditsNeeded,
      cost: creditsNeeded * 0.02,
      provider: 'Email Service',
      emailsSent: emailCount,
      subject: subject?.substring(0, 100),
      recipients: validatedRecipients.map(r => r.email),
      messageId: brevoData.messageId,
      createdAt: new Date().toISOString(),
      remainingBalance: emailCredits - creditsNeeded
    });

    // Track successful API cost
    await trackApiCost(userId, 'email_delivery', creditsNeeded * 0.02, true, {
      messageId: brevoData.messageId,
      recipients: emailCount
    });

    return NextResponse.json({
      success: true,
      messageId: brevoData.messageId,
      emailsSent: emailCount,
      creditsUsed: creditsNeeded,
      remainingCredits: emailCredits - creditsNeeded,
      cost: creditsNeeded * 0.02,
      provider: 'Email Service',
      sentAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Brevo email sending error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Professional Email Delivery',
    cost: '$0.02 per email sent',
    description: 'Send professional emails with delivery tracking and analytics',
    features: [
      'HTML and text email support',
      'Email templates',
      'Delivery tracking',
      'Bounce handling',
      'Analytics and reporting',
      'Attachment support'
    ],
    parameters: {
      required: ['to'],
      optional: ['subject', 'htmlContent', 'textContent', 'sender', 'templateId', 'params', 'attachments', 'tags']
    },
    example: {
      to: [{ email: 'john@example.com', name: 'John Doe' }],
      subject: 'Welcome to our service',
      htmlContent: '<h1>Welcome!</h1><p>Thank you for joining us.</p>',
      sender: { email: 'welcome@company.com', name: 'Company Team' }
    }
  });
}