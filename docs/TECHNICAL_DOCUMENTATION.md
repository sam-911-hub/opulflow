# OpulFlow Technical Documentation

## Architecture Overview

OpulFlow is built using a modern web application stack with the following components:

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Payment Processing**: PayPal, M-PESA
- **AI Integration**: OpenAI API
- **Workflow Automation**: n8n

## Project Structure

```
opulflow/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication routes (login, register)
│   │   ├── admin/              # Admin dashboard
│   │   ├── api/                # API routes
│   │   ├── dashboard/          # User dashboard
│   │   ├── help/               # Help pages
│   │   ├── pricing/            # Pricing page
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── ui/                 # UI components
│   │   └── [feature]/          # Feature-specific components
│   ├── context/                # React context providers
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions and libraries
│   ├── services/               # Service layer for API calls
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── docs/                       # Documentation
└── tests/                      # Test files
```

## Core Features

### Authentication System

OpulFlow uses Firebase Authentication for user management. The authentication flow is as follows:

1. User signs up or logs in using email/password
2. Firebase returns an ID token
3. The ID token is sent to the server to create a session cookie
4. The session cookie is stored in the browser and used for subsequent requests

### Credit System

The credit system is the core of OpulFlow's pay-as-you-go model:

1. Users purchase credits for specific services
2. Credits are stored in the user's Firestore document
3. When a user uses a service, credits are deducted from their account
4. Transactions are recorded in the user's transactions collection
5. Credits expire after 90 days

### API Integration

OpulFlow integrates with several external APIs:

- **OpenAI API**: For AI-powered content generation
- **n8n**: For workflow automation
- **PayPal**: For payment processing
- **M-PESA**: For mobile payments in Africa

### Database Schema

The Firestore database has the following collections:

- **users**: User profiles and credit balances
  - **transactions**: Credit purchase and consumption records
  - **leads**: User's leads
  - **aiGenerations**: AI-generated content
  - **emailDeliveries**: Email tracking data
  - **callAnalyses**: Call analysis results
  - **intentSignals**: Buying intent signals
  - **leadSources**: Lead source tracking
  - **crmIntegrations**: CRM integration settings
  - **apiKeys**: User's API keys
  - **workflows**: Workflow configurations
  - **subscriptions**: Subscription records

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- PayPal developer account
- M-PESA developer account (optional)
- OpenAI API key
- n8n instance (optional)

### Environment Variables

Create a `.env.local` file with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_firebase_admin_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_firebase_admin_client_email
FIREBASE_ADMIN_PRIVATE_KEY="your_firebase_admin_private_key"

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id

# M-PESA Integration
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey

# n8n Workflow Integration
N8N_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key

# Admin Configuration
ADMIN_EMAILS=admin@example.com,another@example.com

# App URL
NEXTAUTH_URL=http://localhost:3000
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/opulflow.git
cd opulflow
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

OpulFlow can be deployed to Vercel, Netlify, or any other platform that supports Next.js applications.

### Vercel Deployment

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure environment variables in the Vercel dashboard
4. Deploy

## Testing

Run tests with:

```bash
npm test
```

## Security Considerations

- All API routes are protected with authentication
- Credits are deducted server-side to prevent tampering
- API keys are stored securely in Firestore
- Session cookies are HTTP-only and secure
- Firebase security rules restrict access to user data

## Performance Optimization

- Next.js App Router for server-side rendering and static generation
- Firestore for scalable, real-time database
- Serverless functions for API routes
- Caching for frequently accessed data
- Lazy loading for components and routes

## Future Improvements

- Add more payment methods
- Implement subscription options
- Add more AI features
- Improve analytics and reporting
- Add more CRM integrations
- Implement team collaboration features