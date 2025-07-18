# OpulFlow

![OpulFlow Logo](src/app/favicon.ico)

## Sales Intelligence Platform

OpulFlow is a next-generation sales intelligence platform offering pay-as-you-go pricing with no subscriptions or lock-in. Access powerful sales tools including lead lookup, company enrichment, email verification, AI-powered content generation, and workflow automation.

## Features

- **Pay-As-You-Go Model**: Only pay for what you use
- **Sales Intelligence**: Lead lookup, company enrichment, email verification
- **AI-Powered Tools**: Email generation, call scripts, sales coaching
- **CRM & Automation**: Mini CRM, workflow automation, email sequences
- **Team Collaboration**: Invite team members and share resources

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Payment**: PayPal, M-PESA integration
- **AI**: OpenAI API integration
- **Automation**: n8n workflow integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- PayPal developer account (for payment processing)
- OpenAI API key (for AI features)
- M-PESA developer account (optional, for mobile payments)
- n8n instance (optional, for workflow automation)

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

3. Set up environment variables:
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

- [API Documentation](docs/API_DOCUMENTATION.md)
- [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)
- [User Guide](docs/USER_GUIDE.md)

## API Routes

OpulFlow provides the following API routes:

### Authentication
- **Create Session**: `POST /api/auth/session`
- **Logout**: `POST /api/auth/logout`
- **Admin Check**: `GET /api/auth/admin`

### Sales Intelligence
- **Lead Lookup**: `POST /api/leads/lookup`
- **Company Enrichment**: `POST /api/companies/enrich`
- **Email Verification**: `POST /api/email/verify`

### AI Features
- **AI Email Generation**: `POST /api/ai/generate`

### Payment Processing
- **M-PESA STK Push**: `POST /api/mpesa/stk-push`
- **M-PESA Status Check**: `GET /api/mpesa/status`
- **M-PESA Callback**: `POST /api/mpesa/callback`

### Workflow Automation
- **List Workflows**: `GET /api/n8n/workflows`
- **Create Workflow**: `POST /api/n8n/workflows`
- **Execute Workflow**: `POST /api/n8n/execute`

See the [API Documentation](docs/API_DOCUMENTATION.md) for more details.

## Core Utilities

- **Authentication**: Firebase Auth with session cookies
- **Error Handling**: Centralized error handling with retry logic
- **OpenAI Integration**: AI-powered content generation
- **Payment Processing**: PayPal and M-PESA integration
- **File Upload**: Firebase Storage integration
- **CSV Import/Export**: Data import and export utilities
- **Currency Conversion**: Multi-currency support
- **Notifications**: In-app notification system

## Testing

Run tests with:

```bash
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Email: opulflow.inc@gmail.com