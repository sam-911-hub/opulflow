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
Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

- [Project Documentation](PROJECT_DOCUMENTATION.md)
- [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)
- [User Guide](docs/USER_GUIDE.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Email: opulflow.inc@gmail.com