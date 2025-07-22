import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'OpulFlow API Services - Complete Integration Suite',
    timestamp: new Date().toISOString(),
    services: {
      // AI & Content Generation
      ai_generation: {
        name: 'AI Content & Image Generation',
        provider: 'DeepAI',
        description: 'Generate text content and images using advanced AI models',
        endpoints: [
          {
            path: '/api/deepai/text-generation',
            method: 'POST',
            cost: '$0.10 per generation',
            description: 'Generate text content from prompts'
          },
          {
            path: '/api/deepai/image-generation',
            method: 'POST',
            cost: '$0.20 per image',
            description: 'Generate images from text descriptions'
          }
        ],
        features: [
          'Multiple AI models',
          'Customizable parameters',
          'High-quality output',
          'Various art styles for images'
        ]
      },

      // Email Services
      email_services: {
        name: 'Professional Email Services',
        providers: ['Hunter.io', 'Brevo'],
        description: 'Email finding, verification, and delivery services',
        endpoints: [
          {
            path: '/api/hunter/email-finder',
            method: 'POST',
            cost: '$0.05 per search',
            description: 'Find email addresses for contacts at companies',
            provider: 'Hunter.io'
          },
          {
            path: '/api/hunter/email-verifier',
            method: 'POST',
            cost: '$0.03 per verification',
            description: 'Verify email address deliverability',
            provider: 'Hunter.io'
          },
          {
            path: '/api/brevo/send-email',
            method: 'POST',
            cost: '$0.02 per email',
            description: 'Send professional emails with tracking',
            provider: 'Brevo'
          },
          {
            path: '/api/brevo/email-analytics',
            method: 'GET',
            cost: '$0.01 per query',
            description: 'Get email delivery and engagement analytics',
            provider: 'Brevo'
          }
        ],
        features: [
          'Email finding and verification',
          'Professional email delivery',
          'Delivery tracking',
          'Analytics and reporting',
          'Template support'
        ]
      },

      // CRM Integration
      crm_integration: {
        name: 'CRM Integration Services',
        provider: 'HubSpot',
        description: 'Create and manage contacts and companies in HubSpot CRM',
        endpoints: [
          {
            path: '/api/hubspot/contacts',
            method: 'POST',
            cost: '$0.15 per contact',
            description: 'Create new contacts in HubSpot'
          },
          {
            path: '/api/hubspot/contacts',
            method: 'GET',
            cost: '$0.10 per search',
            description: 'Search and retrieve contacts from HubSpot'
          },
          {
            path: '/api/hubspot/companies',
            method: 'POST',
            cost: '$0.15 per company',
            description: 'Create new companies in HubSpot'
          },
          {
            path: '/api/hubspot/companies',
            method: 'GET',
            cost: '$0.10 per search',
            description: 'Search and retrieve companies from HubSpot'
          }
        ],
        features: [
          'Contact management',
          'Company data management',
          'Lead status tracking',
          'Custom properties support',
          'Search and filtering'
        ]
      },

      // Business Intelligence
      company_enrichment: {
        name: 'Company Intelligence & Enrichment',
        provider: 'Apify',
        description: 'Extract comprehensive company data from LinkedIn and other sources',
        endpoints: [
          {
            path: '/api/apify/company-enrichment',
            method: 'POST',
            cost: '$0.35 per search',
            description: 'Enrich company data from LinkedIn profiles'
          },
          {
            path: '/api/apify/lead-lookup',
            method: 'POST',
            cost: '$0.30 per search',
            description: 'Find and enrich lead information'
          }
        ],
        features: [
          'LinkedIn company scraping',
          'Employee information',
          'Industry analysis',
          'Company financials',
          'Contact discovery'
        ]
      },

      // Technology Analysis
      tech_analysis: {
        name: 'Website Technology Analysis',
        provider: 'BuiltWith',
        description: 'Discover technologies, frameworks, and tools used by any website',
        endpoints: [
          {
            path: '/api/builtwith/tech-lookup',
            method: 'POST',
            cost: '$0.25 base + optional add-ons',
            description: 'Analyze website technology stack'
          }
        ],
        features: [
          'Current technology detection',
          'Historical technology usage',
          'Technographic data',
          'Technology spend estimates',
          'Categorized breakdown',
          'Premium insights'
        ],
        pricing: {
          basic: '$0.25 per lookup',
          historical: '+$0.25',
          demographics: '+$0.50',
          spend_data: '+$0.50'
        }
      },

      // Additional Services
      existing_services: {
        name: 'Additional Integrated Services',
        description: 'Other services already available in the platform',
        services: [
          {
            name: 'Apollo Integration',
            endpoints: ['/api/apollo/company-enrichment', '/api/apollo/lead-lookup'],
            description: 'Alternative company and lead enrichment'
          },
          {
            name: 'Communication Services',
            endpoints: ['/api/ultramsg/send-whatsapp', '/api/ultramsg/send-sms'],
            description: 'WhatsApp and SMS messaging'
          },
          {
            name: 'Payment Processing',
            endpoints: ['/api/payments/paypal/*', '/api/mpesa/*'],
            description: 'PayPal and M-Pesa payment integration'
          },
          {
            name: 'Workflow Automation',
            endpoints: ['/api/n8n/*'],
            description: 'Automated workflow execution'
          },
          {
            name: 'File Management',
            endpoints: ['/api/files/*'],
            description: 'File upload, storage, and management'
          }
        ]
      }
    },

    // Credit System
    credit_system: {
      description: 'All API services use a credit-based pricing system',
      credit_value: '$0.01 per credit',
      minimum_purchase: '100 credits ($1.00)',
      credit_types: {
        email_verification: 'Used for email finding and verification',
        email_delivery: 'Used for sending emails',
        ai_generation: 'Used for AI text and image generation',
        company_enrichment: 'Used for company data enrichment',
        crm_integration: 'Used for CRM operations',
        tech_analysis: 'Used for technology analysis'
      }
    },

    // Authentication
    authentication: {
      required: true,
      method: 'Session cookie authentication',
      note: 'All API endpoints require valid user authentication'
    },

    // Rate Limiting
    rate_limiting: {
      enabled: true,
      description: 'Rate limiting is applied per service type and user',
      limits: {
        default: '60 requests per minute',
        ai_generation: '30 requests per minute',
        email_delivery: '100 requests per minute'
      }
    },

    // Getting Started
    getting_started: {
      step1: 'Authenticate using your OpulFlow account',
      step2: 'Purchase credits from the dashboard',
      step3: 'Choose an API service from the list above',
      step4: 'Make POST/GET requests to the respective endpoints',
      step5: 'Monitor your credit usage and transaction history'
    },

    // Support
    support: {
      documentation: '/api/services (this endpoint)',
      service_status: '/api/health',
      contact: 'Available through the OpulFlow dashboard'
    }
  });
}