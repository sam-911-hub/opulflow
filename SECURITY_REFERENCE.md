# Security Quick Reference

## Import Security Utilities

```typescript
import {
  requireAuth,
  requireAdmin,
  validateBody,
  validateQuery,
  handleError,
  successResponse,
  rateLimit,
  sanitizeResponse,
  logger,
} from '@/lib/security';
```

## Authentication

```typescript
// Require authenticated user
const user = await requireAuth(request);
// Returns: { uid: string, email: string, role?: string }

// Require admin user
const admin = await requireAdmin(request);
```

## Validation

```typescript
// Validate request body
const data = await validateBody(request, YourDTO);

// Validate query parameters
const params = validateQuery(request, YourQueryDTO);
```

## Error Handling

```typescript
try {
  // Your code
} catch (error) {
  return handleError(error, {
    endpoint: '/api/your-route',
    method: 'POST',
    userId: user?.uid,
  });
}
```

## Success Response

```typescript
return successResponse({ data: result });
// Returns: { success: true, data: result }
```

## Rate Limiting

```typescript
const limiter = rateLimit({ 
  windowMs: 60000,    // 1 minute
  maxRequests: 30     // 30 requests per minute
});

const rateLimitResponse = await limiter(request);
if (rateLimitResponse) return rateLimitResponse;
```

## Logging

```typescript
// Info log
logger.info('Operation completed', { userId, action: 'create' });

// Warning log
logger.warn('Suspicious activity', { userId, ip });

// Error log
logger.error('Operation failed', { userId }, error);

// Debug log (only in development)
logger.debug('Debug info', { data });
```

## Response Sanitization

```typescript
// Generic sanitization
return successResponse(sanitizeResponse(data));

// User-specific sanitization
return successResponse(sanitizeUser(userData));

// Credits sanitization
return successResponse(sanitizeCredits(credits));

// Transaction sanitization
return successResponse(sanitizeTransaction(transaction));
```

## Custom Errors

```typescript
import { AppError } from '@/lib/security/errorHandler';

throw new AppError(400, 'Invalid input');
throw new AppError(403, 'Insufficient credits');
throw new AppError(404, 'Resource not found');
```

## Rate Limit Configurations

```typescript
// Strict (auth endpoints)
rateLimit({ windowMs: 60000, maxRequests: 5 })

// Normal (read operations)
rateLimit({ windowMs: 60000, maxRequests: 100 })

// Moderate (write operations)
rateLimit({ windowMs: 60000, maxRequests: 30 })

// Lenient (public endpoints)
rateLimit({ windowMs: 60000, maxRequests: 60 })
```

## Complete Route Example

```typescript
import { NextRequest } from 'next/server';
import {
  requireAuth,
  validateBody,
  handleError,
  successResponse,
  rateLimit,
  sanitizeResponse,
  logger,
} from '@/lib/security';
import { YourDTO } from '@/lib/security/dto';
import { yourService } from '@/services/yourService';

const limiter = rateLimit({ windowMs: 60000, maxRequests: 30 });

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const user = await requireAuth(request);
    const data = await validateBody(request, YourDTO);
    const result = await yourService.execute(user.uid, data);
    
    logger.info('Operation completed', { userId: user.uid });
    
    return successResponse(sanitizeResponse(result));
  } catch (error) {
    return handleError(error, {
      endpoint: '/api/your-route',
      method: 'POST',
    });
  }
}
```
