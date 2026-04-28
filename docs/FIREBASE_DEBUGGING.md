# Firebase Configuration & Debugging Guide

## Known Issues & Solutions

### 1. Firebase Auth 400 Bad Request Error
**Error:** `POST https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=... 400 (Bad Request)`

**Possible Causes:**
- API key is restricted to specific IPs/domains and current domain is not whitelisted
- API key is restricted to specific APIs (Identity Toolkit API not enabled)
- Domain is not added to authorized domains in Firebase Console
- Rate limiting from too many requests in short period
- Invalid or expired API key

**Solutions:**
1. **Check API Key Restrictions:**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate New Private Key" or check existing credentials
   - Go to Google Cloud Console > APIs & Services > Credentials
   - Find the API key and edit it
   - Check "API restrictions" - ensure "Identity Toolkit API" is selected or "All APIs" is chosen
   - Check "Application restrictions" - if "IP addresses" is selected, add your domain's IP(s)

2. **Whitelist Domain:**
   - Firebase Console > Authentication > Settings > Authorized domains
   - Add production domain (e.g., `www.opulflow.top`, `opulflow.top`)
   - Ensure both www and non-www versions are added if applicable

3. **Verify Environment Variables:**
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=<your-api-key>
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<project>.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
   NEXT_PUBLIC_FIREBASE_APP_ID=<app-id>
   ```

4. **Check Rate Limiting:**
   - If error occurs after many registration attempts in short time, wait before retrying
   - Implement rate limiting on frontend

### 2. Firestore Persistence Layer Errors
**Error:** `Failed to obtain exclusive access to the persistence layer`

**Cause:** Multiple tabs trying to access IndexedDB simultaneously with persistent cache enabled

**Solution:** Already implemented in `firebaseClient.ts`
- Uses persistent cache with automatic fallback to memory cache
- See code for error handling

### 3. Order API 404 Error in Production
**Error:** `POST https://www.opulflow.top/api/orders/create 404 (Not Found)`

**Possible Causes:**
- API route not deployed to production
- Build process doesn't include API routes
- Routing issue in Next.js deployment platform

**Solutions:**
1. **Verify Build Includes API Routes:**
   ```bash
   npm run build
   # Check output - should see ✓ Compiled successfully
   ```

2. **Check .vercel (if using Vercel) or deployment config:**
   - Ensure `vercel.json` doesn't exclude API routes
   - Check Next.js build output for API routes

3. **Fallback Implementation:**
   - Client-side Firestore fallback is implemented in `lib/orderFallback.ts`
   - When API fails, orders are created directly via client Firebase SDK
   - Failed orders are tracked in `failedOrders` localStorage key for recovery

### 4. Offline Detection Issues
**Error:** `Failed to get document because the client is offline`

**Cause:** Firestore memory cache cannot serve requests while truly offline, or network connectivity issue

**Solution:**
- Current implementation gracefully handles offline errors
- Dashboard will retry with timeouts
- Failed data operations are cached in localStorage for later sync

## Environment Setup Checklist

- [ ] Firebase API Key configured and not restricted by domain/IP
- [ ] All required Firebase APIs enabled in Google Cloud Console
- [ ] Production domain(s) added to Firebase Authorized Domains
- [ ] Environment variables properly set in deployment platform
- [ ] Build includes API routes (verify in build output)
- [ ] Session cookie security settings appropriate for HTTPS

## Testing Recommendations

1. **Test Auth with Different Networks:**
   ```javascript
   // In browser console
   fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       idToken: 'test-token',
       key: 'YOUR_API_KEY'
     })
   }).then(r => r.json()).then(console.log)
   ```

2. **Test Firestore Access:**
   - Verify session cookie is set after login
   - Check Network tab for `/api/user` requests
   - Verify Firestore rules allow reads/writes for authenticated users

3. **Monitor Errors:**
   - Enable Firebase Performance Monitoring
   - Check Firebase Console > Logs for errors
   - Monitor Google Cloud Console for quota issues

## Deployment Notes

### Vercel
- API routes should be automatically deployed
- Ensure `api/` directory is included in source
- Check Vercel Logs > Runtime Logs for errors

### Replit/Self-hosted
- Verify environment variables are set
- Ensure Node.js version is compatible
- Check server logs for startup errors

## Useful References
- [Firebase API Key Best Practices](https://firebase.google.com/docs/projects/api-keys)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
