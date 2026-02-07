// Sanitize responses to prevent exposing sensitive data

const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'privateKey',
  'sessionToken',
  'idToken',
  'firebaseToken',
  'stripeKey',
  'paypalSecret',
  'mpesaSecret',
  'openaiKey',
];

const INTERNAL_FIELDS = [
  '_id',
  '__v',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'internalId',
];

export function sanitizeResponse<T>(data: T, options?: {
  removeSensitive?: boolean;
  removeInternal?: boolean;
  allowedFields?: string[];
}): T {
  const {
    removeSensitive = true,
    removeInternal = false,
    allowedFields,
  } = options || {};

  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeResponse(item, options)) as T;
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip sensitive fields
    if (removeSensitive && SENSITIVE_FIELDS.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    )) {
      continue;
    }

    // Skip internal fields
    if (removeInternal && INTERNAL_FIELDS.includes(key)) {
      continue;
    }

    // Only include allowed fields if specified
    if (allowedFields && !allowedFields.includes(key)) {
      continue;
    }

    // Recursively sanitize nested objects
    if (value && typeof value === 'object') {
      sanitized[key] = sanitizeResponse(value, options);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

export function sanitizeUser(user: any) {
  return sanitizeResponse(user, {
    removeSensitive: true,
    removeInternal: true,
    allowedFields: [
      'uid',
      'email',
      'name',
      'displayName',
      'photoURL',
      'role',
      'credits',
      'plan',
      'createdAt',
    ],
  });
}

export function sanitizeCredits(credits: any) {
  return sanitizeResponse(credits, {
    allowedFields: [
      'leads',
      'companies',
      'emails',
      'ai',
      'techstack',
      'intent',
      'calls',
      'crm',
      'workflows',
    ],
  });
}

export function sanitizeTransaction(transaction: any) {
  return sanitizeResponse(transaction, {
    removeSensitive: true,
    allowedFields: [
      'id',
      'amount',
      'currency',
      'status',
      'type',
      'description',
      'createdAt',
    ],
  });
}
