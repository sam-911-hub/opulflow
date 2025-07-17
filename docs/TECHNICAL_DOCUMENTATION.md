# OpulFlow Technical Documentation

## Architecture Overview

OpulFlow is built using a modern web application stack with serverless architecture:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Next.js    │     │  Firebase   │     │ Third-party │
│  Frontend   │────▶│  Backend    │────▶│  Services   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Frontend (Next.js)
- **App Router**: Utilizes Next.js 13+ app router for page routing
- **React Components**: Modular component architecture
- **Tailwind CSS**: Utility-first CSS framework for styling
- **TypeScript**: Type-safe code implementation

### Backend (Firebase)
- **Authentication**: User management and session handling
- **Firestore**: NoSQL database for data storage
- **Cloud Functions**: Serverless functions for backend logic
- **Security Rules**: Fine-grained access control

## Core Components

### Authentication System
- Email/password authentication
- Session management
- User profile data

### Credit System
- Credit types (lead_lookup, company_enrichment, email_verification, ai_email, etc.)
- Credit transactions (purchase, consumption)
- Credit expiration (90 days)

### Sales Intelligence
- Lead lookup API integration
- Company data enrichment
- Email verification service

### AI Tools
- OpenAI API integration
- Email generation
- Sales script creation
- Call analysis

### Workflow Automation
- n8n integration
- Custom workflow templates
- Workflow execution tracking

## Database Schema Details

### User Document
```
users/{userId}
├── email: string
├── accountType: "free" | "pro"
├── role: "owner" | "admin" | "member"
├── credits: {
│   ├── lead_lookup: number
│   ├── company_enrichment: number
│   ├── email_verification: number
│   ├── ai_email: number
│   └── workflow: number
│ }
├── usage: {
│   ├── leads: number
│   ├── enrichment: number
│   ├── workflowRuns: number
│   ├── emailWriter: number
│   └── callScripts: number
│ }
├── createdAt: timestamp
└── resetDate: timestamp
```

### Transaction Document
```
users/{userId}/transactions/{transactionId}
├── type: "purchase" | "consumption"
├── amount: number
├── service: string (credit type)
├── createdAt: timestamp
├── remainingBalance: number
└── bundleId?: string
```

### Lead Document
```
users/{userId}/leads/{leadId}
├── name: string
├── email: string
├── company: string
├── title?: string
├── phone?: string
├── status: "new" | "contacted" | "qualified" | "lost"
├── lastContacted?: timestamp
├── notes?: string
├── createdAt: timestamp
└── updatedAt?: timestamp
```

## API Integrations

### Payment Processing
- PayPal REST API
- M-PESA API (for East African markets)

### AI Services
- OpenAI GPT API
- Custom prompt engineering

### Workflow Automation
- n8n API
- Custom workflow templates

## Security Implementation

### Firestore Security Rules
- Role-based access control
- Data isolation between users
- Team-based sharing permissions

### API Key Management
- Secure storage in Firestore
- Service-specific keys (OpenAI, Salesforce, HubSpot, Zapier)

## Deployment Process

1. Code pushed to GitHub repository
2. Vercel builds and deploys Next.js frontend
3. Firebase deploys backend services and security rules

## Environment Variables

- `NEXT_PUBLIC_FIREBASE_*`: Firebase configuration
- `PAYPAL_CLIENT_ID`: PayPal integration
- `MPESA_*`: M-PESA integration
- `OPENAI_API_KEY`: OpenAI integration
- `N8N_*`: n8n workflow automation

## Testing Strategy

- Unit tests for core components
- Integration tests for API services
- End-to-end tests for critical user flows

## Performance Considerations

- Next.js static generation for marketing pages
- Client-side rendering for dynamic dashboard
- Firebase query optimization
- Lazy loading of heavy components