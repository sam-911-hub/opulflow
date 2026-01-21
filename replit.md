# OpulFlow

## Overview
OpulFlow is a Next.js 15 application with Firebase authentication and Firestore database integration. It appears to be a business/CRM platform with features like:
- User authentication and authorization
- Credit-based system
- AI email features
- Lead lookup and company enrichment
- Payment integration (Stripe, PayPal, M-Pesa)
- Workflow automation via n8n

## Project Structure
- **Framework**: Next.js 15.3.5 with React 19
- **Styling**: Tailwind CSS 3.x with custom theme variables
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **UI Components**: Radix UI primitives

## Key Directories
- `/src/app` - Next.js app router pages
- `/src/components` - React components
- `/src/lib` - Utility functions and Firebase config
- `/src/context` - React context providers (Auth)
- `/src/hooks` - Custom React hooks
- `/src/services` - Business logic services

## Configuration
- Port: 5000 (frontend)
- Host: 0.0.0.0 (for Replit compatibility)

## Environment Variables Required
The app requires Firebase configuration:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Running the App
```bash
npm run dev     # Development server
npm run build   # Production build
npm run start   # Production server
```

## Recent Changes
- Configured for Replit environment (port 5000, allowed origins)
- Fixed Tailwind CSS configuration for v3.x compatibility
- Added auth export to firebase.ts
