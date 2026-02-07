# Deployment Guide

## Deploy OpulFlow from GitHub

OpulFlow can be deployed directly from GitHub to Vercel (recommended) or other platforms that support Next.js server-side features.

### Option 1: Vercel (Recommended)

Vercel is the recommended platform as it's built by the Next.js team and provides seamless deployment.

#### Quick Deploy

1. **Connect GitHub Repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

2. **Configure Environment Variables:**
   Add these in Vercel Dashboard → Settings → Environment Variables:
   
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID
   FIREBASE_ADMIN_PROJECT_ID
   FIREBASE_ADMIN_CLIENT_EMAIL
   FIREBASE_ADMIN_PRIVATE_KEY
   ADMIN_EMAILS
   PAYPAL_CLIENT_ID
   PAYPAL_CLIENT_SECRET
   OPENAI_API_KEY
   NEXT_PUBLIC_APP_URL
   ```

3. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main/master

#### Automated GitHub Actions Deployment

1. **Get Vercel Token:**
   - Go to Vercel → Settings → Tokens
   - Create a new token

2. **Add GitHub Secrets:**
   Go to your GitHub repository → Settings → Secrets and variables → Actions
   
   Add:
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: Found in Vercel project settings
   - `VERCEL_PROJECT_ID`: Found in Vercel project settings

3. **Push to GitHub:**
   The workflow in `.github/workflows/deploy.yml` will automatically deploy

### Option 2: Netlify

1. **Connect Repository:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Install the Next.js plugin (auto-detected)

3. **Add Environment Variables:**
   Same variables as Vercel (see above)

### Option 3: Railway

1. **Deploy from GitHub:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure:**
   - Railway auto-detects Next.js
   - Add environment variables in Settings

### Option 4: Self-Hosted (VPS/Cloud)

For AWS, DigitalOcean, or other VPS:

1. **Clone Repository:**
   ```bash
   git clone https://github.com/yourusername/opulflow.git
   cd opulflow
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Environment Variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Build:**
   ```bash
   npm run build
   ```

5. **Start:**
   ```bash
   npm start
   ```

6. **Use PM2 for Production:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "opulflow" -- start
   pm2 save
   pm2 startup
   ```

### Environment Variables Reference

See `.env.example` for all required environment variables.

**Critical Variables:**
- Firebase credentials (both client and admin)
- PayPal credentials for payments
- OpenAI API key for AI features
- Admin emails for admin access

### Post-Deployment

1. **Update Firebase Configuration:**
   - Add your deployment URL to Firebase authorized domains
   - Update OAuth redirect URLs

2. **Update PayPal Configuration:**
   - Add your deployment URL to PayPal app settings

3. **Test Deployment:**
   - Test authentication flow
   - Test payment processing
   - Test AI features

### Troubleshooting

**Build Fails:**
- Check all environment variables are set
- Ensure Node.js version is 18+
- Check build logs for specific errors

**Firebase Admin Errors:**
- Verify FIREBASE_ADMIN_PRIVATE_KEY is properly formatted
- Ensure all three admin variables are set

**API Routes Not Working:**
- Ensure platform supports Next.js API routes
- Check serverless function logs

### Continuous Deployment

Once connected to GitHub:
- Push to `main` or `master` branch triggers automatic deployment
- Pull requests create preview deployments (Vercel/Netlify)
- Rollback available through platform dashboard

### Monitoring

- Use Vercel Analytics or platform-specific monitoring
- Set up error tracking (Sentry recommended)
- Monitor Firebase usage and quotas
- Track API costs (OpenAI, PayPal)
