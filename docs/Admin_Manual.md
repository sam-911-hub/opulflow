# OpulFlow Administrator Manual

## Introduction

This manual is designed for system administrators who manage the technical aspects of OpulFlow. It covers installation, configuration, maintenance, and troubleshooting of the platform.

## System Requirements

### Server Requirements
- Node.js 18.0 or higher
- NPM 8.0 or higher
- 2GB RAM minimum (4GB recommended)
- 10GB storage minimum

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Network Requirements
- HTTPS configuration
- WebSocket support
- API endpoints accessibility

## Installation

### Local Development Setup

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
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
PAYPAL_CLIENT_ID=your_paypal_client_id
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
OPENAI_API_KEY=your_openai_api_key
N8N_URL=your_n8n_url
N8N_API_KEY=your_n8n_api_key
```

5. Run the development server:
```bash
npm run dev
```

### Production Deployment

#### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy the application
4. Set up custom domain if needed

#### Firebase Configuration
1. Create a new Firebase project
2. Enable Authentication services
3. Set up Firestore database
4. Configure security rules
5. Deploy Firebase functions

## Configuration

### Firebase Setup

#### Authentication Configuration
1. Go to Firebase Console > Authentication
2. Enable Email/Password authentication
3. Configure password requirements
4. Set up email templates for verification and password reset

#### Firestore Configuration
1. Navigate to Firebase Console > Firestore
2. Create database in your preferred region
3. Start in production mode
4. Deploy security rules from `firestore.rules`

#### Firebase Functions
1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```

4. Deploy Firebase functions:
```bash
firebase deploy --only functions
```

### Payment Integration

#### PayPal Configuration
1. Create a PayPal Developer account
2. Create a new application
3. Get Client ID and Secret
4. Configure webhook URLs
5. Set up IPN listeners

#### M-PESA Configuration
1. Register for Safaricom Developer account
2. Create a new app
3. Get Consumer Key and Secret
4. Configure callback URLs
5. Test with sandbox environment

### AI Integration

#### OpenAI Setup
1. Create an OpenAI account
2. Generate API keys
3. Set usage limits
4. Configure model parameters
5. Implement rate limiting

### Workflow Automation

#### n8n Setup
1. Deploy n8n instance
2. Configure API access
3. Create base workflows
4. Set up webhook endpoints
5. Configure credentials

## System Administration

### User Management

#### Creating Admin Users
1. Register a normal user account
2. Use Firebase Admin SDK to update user claims:
```javascript
admin.auth().setCustomUserClaims(uid, { admin: true });
```

3. Verify admin status in the Auth user record

#### Managing User Accounts
1. View all users in Firebase Authentication console
2. Disable or enable accounts as needed
3. Reset passwords for users
4. Delete user accounts if required

### Database Management

#### Backup Procedures
1. Schedule regular Firestore exports:
```bash
gcloud firestore export gs://[BUCKET_NAME]/[EXPORT_PREFIX]/
```

2. Set up automated backup scripts
3. Verify backup integrity
4. Document restoration procedures

#### Data Migration
1. Export data from source:
```bash
gcloud firestore export gs://[BUCKET_NAME]/[EXPORT_PREFIX]/
```

2. Import data to destination:
```bash
gcloud firestore import gs://[BUCKET_NAME]/[EXPORT_PREFIX]/
```

3. Verify data integrity after migration

### Security Management

#### Security Rules Deployment
1. Update security rules in `firestore.rules`
2. Deploy updated rules:
```bash
firebase deploy --only firestore:rules
```

3. Test rules with security rules simulator

#### API Key Rotation
1. Generate new API keys for services
2. Update environment variables
3. Deploy changes
4. Verify functionality with new keys
5. Revoke old keys

### Monitoring and Logging

#### Setting Up Monitoring
1. Configure Firebase Performance Monitoring
2. Set up Sentry for error tracking
3. Implement custom logging
4. Configure alerts for critical events

#### Log Analysis
1. Access Firebase logs in console
2. Filter logs by severity and type
3. Set up log exports to BigQuery
4. Create log analysis dashboards

## Maintenance

### Regular Updates

#### Dependency Updates
1. Check for outdated packages:
```bash
npm outdated
```

2. Update dependencies:
```bash
npm update
```

3. Test application after updates
4. Document changes and potential issues

#### Feature Deployments
1. Merge feature branches to main
2. Run pre-deployment tests
3. Deploy to staging environment
4. Verify functionality
5. Deploy to production

### Performance Optimization

#### Frontend Optimization
1. Run Lighthouse audits
2. Optimize image assets
3. Implement code splitting
4. Configure caching strategies
5. Minimize bundle size

#### Database Optimization
1. Review and optimize queries
2. Set up appropriate indexes
3. Monitor query performance
4. Implement data sharding if needed

### Scaling Considerations

#### Horizontal Scaling
1. Configure Firebase to handle increased load
2. Set up regional deployments if needed
3. Implement caching strategies
4. Configure CDN for static assets

#### Vertical Scaling
1. Upgrade Firebase plan as needed
2. Monitor resource usage
3. Optimize resource-intensive operations
4. Implement background processing for heavy tasks

## Troubleshooting

### Common Issues

#### Authentication Problems
- Verify Firebase configuration
- Check security rules
- Inspect authentication logs
- Test with Firebase Authentication Emulator

#### Payment Processing Issues
- Verify API credentials
- Check webhook configurations
- Inspect transaction logs
- Test with sandbox environments

#### Performance Issues
- Run performance profiling
- Check database query performance
- Monitor API response times
- Analyze client-side rendering performance

### Diagnostic Procedures

#### Log Analysis
1. Access Firebase logs
2. Filter by error severity
3. Identify patterns in errors
4. Correlate with user reports

#### Performance Testing
1. Run load tests with appropriate tools
2. Monitor response times under load
3. Identify bottlenecks
4. Implement optimizations

### Recovery Procedures

#### Data Recovery
1. Identify data loss or corruption
2. Restore from latest backup
3. Verify data integrity
4. Document incident and resolution

#### Service Recovery
1. Identify service disruption
2. Implement temporary workarounds
3. Fix root cause
4. Deploy fixes
5. Verify service restoration

## Appendices

### Command Reference
- Firebase CLI commands
- Next.js commands
- Deployment scripts
- Backup and restore commands

### Configuration Templates
- Environment variable templates
- Security rules templates
- Workflow templates
- Integration configuration templates

### Troubleshooting Flowcharts
- Authentication issues
- Payment processing issues
- Performance problems
- Data synchronization issues

### Contact Information
- Technical support contacts
- Vendor support contacts
- Emergency escalation procedures
- Documentation resources