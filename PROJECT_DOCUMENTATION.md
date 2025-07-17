# OpulFlow - Sales Intelligence Platform

## Project Overview

OpulFlow is a pay-as-you-go sales intelligence platform designed to provide modern sales teams with powerful tools without subscription lock-in. The platform offers lead lookup, company enrichment, email verification, AI-powered tools, and workflow automation on a credit-based system.

## Key Features

- **Pay-As-You-Go Model**: Users only pay for what they use with no subscriptions
- **Sales Intelligence**: Lead lookup, company enrichment, and email verification
- **AI-Powered Tools**: Email generation, call scripts, and sales coaching
- **CRM & Automation**: Mini CRM, workflow automation, and email sequences
- **Team Collaboration**: Invite team members and share resources

## Technical Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **Payment Processing**: PayPal, M-PESA
- **AI Integration**: OpenAI API
- **Workflow Automation**: n8n

## Architecture

The application follows a client-server architecture with:

1. **Next.js Frontend**: Handles UI rendering and client-side logic
2. **Firebase Backend**: Manages authentication, database, and serverless functions
3. **Third-party Integrations**: Payment processing, AI services, and workflow automation

## Database Schema

### Users Collection
- User authentication details
- Account type (free/pro)
- Credit balances
- Usage metrics

### Subcollections
- **credits**: Credit transactions
- **leads**: User's leads database
- **apiKeys**: Integration API keys
- **transactions**: Payment and usage transactions
- **emailSequences**: Email automation sequences
- **workflows**: Automation workflows
- **aiGenerations**: AI-generated content

### Team Collections
- **team_members**: Team membership and permissions
- **shared_workflows**: Shared automation workflows

## Security

- Firebase Authentication for user management
- Firestore security rules for data access control
- Role-based permissions (owner, admin, member)
- API key encryption and secure storage

## Deployment

The application is deployed using:
- Vercel for the Next.js frontend
- Firebase for backend services
- GitHub for version control

## Future Enhancements

1. **Chrome Extension**: Browser extension for LinkedIn and other sales platforms
2. **Advanced Analytics**: Deeper insights into sales performance
3. **Additional Payment Methods**: Support for more regional payment options
4. **Enterprise Features**: SSO, advanced team management, and custom integrations

## Contact

For support or inquiries: opulflow.inc@gmail.com