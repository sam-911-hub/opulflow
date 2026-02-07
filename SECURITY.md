# Security Implementation Guide

## Overview

OpulFlow implements enterprise-grade security measures to protect user data and prevent common vulnerabilities.

## Security Features

### 1. Error Handling
- **Never expose internal errors** to users
- All errors logged internally with full stack traces
- Users see generic messages: "Something went wrong", "Successful"
- Database errors, stack traces, and tool failures are sanitized

### 2. Data Transfer Objects (DTOs)
- All incoming requests validated using Zod schemas
- DTOs prevent unexpected fields
- Improves validation and protects domain logic
- Type-safe request handling

### 3. JWT Security
- JWTs stored in **HTTP-only cookies** (not localStorage)
- Prevents XSS attacks
- Secure flag enabled in production
- SameSite protection enabled

### 4. Input Validation
- All incoming data validated
- Types, formats, lengths, and required fields checked
- Zod schemas for compile-time and runtime validation

### 5. Secrets Management
- **No hardcoded secrets** in code
- All secrets in environment variables
- API keys, DB passwords, JWT secrets externalized

### 6. HTTP Status Codes
- Proper status codes for all responses
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error
- 503: Service Unavailable

### 7. Separation of Concerns
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **DTOs**: Define data contracts
- Clean architecture principles

### 8. Logging
- All errors logged with context
- Sensitive data sanitized before logging
- Structured logging for production monitoring

### 9. Response Sanitization
- Passwords never returned
- Tokens never exposed
- Internal IDs filtered
- Only necessary data returned

### 10. Rate Limiting
- Prevents brute force attacks
- Configurable per endpoint
- IP-based tracking
- Automatic cleanup

### 11. Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Admin-only endpoints protected
- Session validation on every request

## Implementation Examples

### Secure API Route Pattern

```typescript
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/security/auth';
import { validateBody } from '@/lib/security/validation';
import { handleError, successResponse } from '@/lib/security/errorHandler';
import { rateLimit } from '@/lib/security/rateLimit';
import { sanitizeResponse } from '@/lib/security/sanitizer';

const limiter = rateLimit({ windowMs: 60000, maxRequests: 30 });

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // 2. Authentication
    const user = await requireAuth(request);
    
    // 3. Validate input with DTO
    const data = await validateBody(request, YourDTO);
    
    // 4. Business logic in service
    const result = await yourService.doSomething(user.uid, data);
    
    // 5. Sanitize and return
    return successResponse(sanitizeResponse(result));
  } catch (error) {
    // 6. Secure error handling
    return handleError(error, {
      endpoint: '/api/your-endpoint',
      method: 'POST',
    });
  }
}
```

### Creating DTOs

```typescript
import { z } from 'zod';

export const YourDTO = z.object({
  email: z.string().email('Invalid email'),
  amount: z.number().positive().max(10000),
  type: z.enum(['option1', 'option2']),
});

export type YourInput = z.infer<typeof YourDTO>;
```

### Service Layer

```typescript
import { AppError } from '@/lib/security/errorHandler';
import { logger } from '@/lib/security/logger';

export class YourService {
  async doSomething(userId: string, data: any) {
    try {
      // Business logic here
      logger.info('Operation performed', { userId });
      return result;
    } catch (error) {
      logger.error('Operation failed', { userId }, error);
      throw error;
    }
  }
}
```

## Security Checklist

- [ ] All API routes use rate limiting
- [ ] All routes validate input with DTOs
- [ ] Authentication required for protected routes
- [ ] Errors handled with handleError()
- [ ] Responses sanitized before returning
- [ ] Business logic in service layer
- [ ] No secrets in code
- [ ] JWTs in HTTP-only cookies
- [ ] Proper HTTP status codes
- [ ] All errors logged internally

## Environment Variables

Required environment variables (never commit these):

```
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
ADMIN_EMAILS=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
OPENAI_API_KEY=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
N8N_API_KEY=
```

## Common Vulnerabilities Prevented

1. **XSS (Cross-Site Scripting)**: HTTP-only cookies, input validation
2. **SQL Injection**: Firestore (NoSQL), parameterized queries
3. **CSRF**: SameSite cookies, token validation
4. **Brute Force**: Rate limiting
5. **Information Disclosure**: Error sanitization, response filtering
6. **Broken Authentication**: JWT validation, secure sessions
7. **Sensitive Data Exposure**: Response sanitization, logging filters
8. **Mass Assignment**: DTO validation, allowed fields only

## Monitoring & Alerts

Set up monitoring for:
- Failed authentication attempts
- Rate limit violations
- Error rates
- Unusual access patterns
- Credit usage anomalies

## Incident Response

If a security incident occurs:
1. Check logs for full context
2. Identify affected users
3. Revoke compromised sessions
4. Rotate secrets if needed
5. Notify affected users
6. Document and learn

## Regular Security Tasks

- [ ] Review logs weekly
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Security audit annually
- [ ] Penetration testing annually
