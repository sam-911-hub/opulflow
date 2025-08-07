# OpulFlow API Documentation

## Overview

OpulFlow provides a set of RESTful APIs for accessing sales intelligence features. All API endpoints require authentication via session cookies or API keys.

## Authentication

### Session-based Authentication

Most API endpoints use session-based authentication. When a user logs in, a session cookie is created and stored in the browser. This cookie is sent with each request to authenticate the user.

### API Key Authentication

For programmatic access, you can use API keys. API keys can be generated in the dashboard under Settings → API Configuration.

```
Authorization: Bearer YOUR_API_KEY
```

## API Endpoints

### User Management

**Endpoint:** `POST /api/users/register`

**Description:** Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "uid": "user123456"
}
```

**Endpoint:** `GET /api/users/profile`

**Description:** Get the current user's profile information.

**Response:**
```json
{
  "profile": {
    "email": "user@example.com",
    "displayName": "John Doe",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "credits": 100,
    "role": "user"
  }
}
```

**Endpoint:** `PUT /api/users/profile`

**Description:** Update the current user's profile information.

**Request Body:**
```json
{
  "displayName": "John Smith",
  "company": "Example Inc",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true
}
```

### Credits Management

**Endpoint:** `GET /api/credits/balance`

**Description:** Get the current user's credit balance.

**Response:**
```json
{
  "credits": 100
}
```

**Endpoint:** `GET /api/credits/history`

**Description:** Get the user's credit transaction history.

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "transactions": [
    {
      "id": "tx123456",
      "type": "purchase",
      "credits": 100,
      "amount": 10,
      "timestamp": "2023-01-01T00:00:00.000Z",
      "paymentMethod": "paypal"
    },
    {
      "id": "tx123457",
      "type": "usage",
      "credits": 1,
      "service": "lead_lookup",
      "timestamp": "2023-01-02T00:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 2,
    "hasMore": false
  }
}
```

### Payment Processing

**Endpoint:** `POST /api/payments/paypal/create`

**Description:** Create a PayPal order for purchasing credits.

**Request Body:**
```json
{
  "amount": 10,
  "creditPackage": "250 credits"
}
```

**Response:**
```json
{
  "id": "order123456",
  "status": "CREATED",
  "links": [
    {
      "href": "https://www.paypal.com/checkoutnow?token=order123456",
      "rel": "approve",
      "method": "GET"
    }
  ]
}
```

**Endpoint:** `POST /api/payments/paypal/verify`

**Description:** Verify and capture a PayPal payment.

**Request Body:**
```json
{
  "orderId": "order123456"
}
```

**Response:**
```json
{
  "success": true,
  "credits": 250,
  "orderId": "order123456"
}
```

### Contact Management

**Endpoint:** `GET /api/contacts`

**Description:** Get a list of contacts.

**Query Parameters:**
- `limit` (optional): Number of contacts to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `search` (optional): Search term for filtering contacts

**Response:**
```json
{
  "contacts": [
    {
      "id": "contact123456",
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Example Inc",
      "phone": "+1234567890",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

**Endpoint:** `POST /api/contacts`

**Description:** Create a new contact.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Example Inc",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "id": "contact123456"
}
```

**Endpoint:** `POST /api/contacts/import`

**Description:** Import multiple contacts.

**Request Body:**
```json
{
  "contacts": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Example Inc"
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "company": "Another Inc"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "imported": 2,
  "total": 2
}
```

**Endpoint:** `GET /api/contacts/export`

**Description:** Export contacts.

**Query Parameters:**
- `format` (optional): Export format, either "json" or "csv" (default: "json")

**Response (JSON):**
```json
{
  "contacts": [
    {
      "id": "contact123456",
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Example Inc"
    }
  ]
}
```

**Response (CSV):**
CSV file download with headers and data.

### Dashboard

**Endpoint:** `GET /api/dashboard/stats`

**Description:** Get dashboard statistics.

**Query Parameters:**
- `period` (optional): Time period for stats, either "7d", "30d", "90d", or "1y" (default: "30d")

**Response:**
```json
{
  "currentCredits": 100,
  "creditUsage": 25,
  "creditPurchases": 100,
  "contactsCount": 50,
  "recentActivities": [
    {
      "id": "activity123456",
      "type": "lead_lookup",
      "description": "Looked up contact information",
      "timestamp": "2023-01-01T00:00:00.000Z"
    }
  ],
  "period": "30d"
}
```

### Lead Lookup

**Endpoint:** `POST /api/leads/lookup`

**Description:** Look up contact information for potential customers.

**Request Body:**
```json
{
  "email": "john@example.com",
  "domain": "example.com",
  "name": "John Doe",
  "company": "Example Inc"
}
```
At least one of the parameters is required.

**Response:**
```json
{
  "id": "lead_123456",
  "name": "John Doe",
  "email": "john@example.com",
  "title": "CEO",
  "company": "Example Inc",
  "phone": "+1234567890",
  "linkedin": "https://linkedin.com/in/johndoe",
  "twitter": "@johndoe",
  "verified": true,
  "source": "OpulFlow Database"
}
```

**Credits:** 1 lead lookup credit per request

### Company Enrichment

**Endpoint:** `POST /api/companies/enrich`

**Description:** Get detailed company data and technographics.

**Request Body:**
```json
{
  "domain": "example.com",
  "name": "Example Inc"
}
```
At least one of the parameters is required.

**Response:**
```json
{
  "id": "company_123456",
  "name": "Example Inc",
  "domain": "example.com",
  "description": "Example company description",
  "industry": "Technology",
  "size": "51-200",
  "founded": 2010,
  "location": "San Francisco, CA",
  "funding": "$10M Series A",
  "technologies": ["React", "Node.js", "AWS"],
  "social": {
    "linkedin": "https://linkedin.com/company/example",
    "twitter": "@example"
  }
}
```

**Credits:** 1 company enrichment credit per request

### Email Verification

**Endpoint:** `POST /api/email/verify`

**Description:** Verify email deliverability in real-time.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "email": "john@example.com",
  "valid": true,
  "deliverable": true,
  "disposable": false,
  "reason": "valid_format",
  "credits_remaining": 9
}
```

**Credits:** 1 email verification credit per request

### AI Email Generation

**Endpoint:** `POST /api/ai/generate`

**Description:** Generate personalized emails using AI.

**Request Body:**
```json
{
  "prompt": "Follow up with a customer who showed interest in our product",
  "style": "professional",
  "recipient": "John"
}
```

**Response:**
```json
{
  "text": "Dear John,\n\nThank you for your interest in our services. Follow up with a customer who showed interest in our product\n\nWe look forward to working with you.\n\nBest regards,\n[Your Name]\n[Your Company]",
  "credits_remaining": 9
}
```

**Credits:** 1 AI email credit per request

### API Key Management

**Endpoint:** `POST /api/keys/create`

**Description:** Generate a new API key for programmatic access.

**Request Body:**
```json
{
  "name": "My API Key"
}
```

**Response:**
```json
{
  "id": "key123456",
  "name": "My API Key",
  "key": "opul_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

**Endpoint:** `GET /api/keys/list`

**Description:** List all API keys for the current user.

**Response:**
```json
{
  "apiKeys": [
    {
      "id": "key123456",
      "name": "My API Key",
      "keyPreview": "opul_a1b2...o5p6",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "lastUsed": "2023-01-02T00:00:00.000Z",
      "active": true
    }
  ]
}
```

**Endpoint:** `POST /api/keys/revoke`

**Description:** Revoke an API key.

**Request Body:**
```json
{
  "keyId": "key123456"
}
```

**Response:**
```json
{
  "success": true
}
```

### Email Sequences

**Endpoint:** `POST /api/sequences/create`

**Description:** Create a new email sequence.

**Request Body:**
```json
{
  "name": "Follow-up Sequence",
  "steps": [
    {
      "subject": "Initial Contact",
      "content": "Hello {{name}},\n\nThank you for your interest...",
      "delayDays": 0
    },
    {
      "subject": "Follow-up",
      "content": "Hello {{name}},\n\nI wanted to follow up...",
      "delayDays": 3
    }
  ]
}
```

**Response:**
```json
{
  "id": "seq123456",
  "name": "Follow-up Sequence",
  "steps": [
    {
      "order": 1,
      "subject": "Initial Contact",
      "content": "Hello {{name}},\n\nThank you for your interest...",
      "delayDays": 0
    },
    {
      "order": 2,
      "subject": "Follow-up",
      "content": "Hello {{name}},\n\nI wanted to follow up...",
      "delayDays": 3
    }
  ],
  "active": true,
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

**Endpoint:** `GET /api/sequences/list`

**Description:** List all email sequences.

**Query Parameters:**
- `limit` (optional): Number of sequences to return (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "sequences": [
    {
      "id": "seq123456",
      "name": "Follow-up Sequence",
      "stepsCount": 2,
      "active": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

**Endpoint:** `PUT /api/sequences/update`

**Description:** Update an email sequence.

**Request Body:**
```json
{
  "id": "seq123456",
  "name": "Updated Sequence Name",
  "active": true,
  "steps": [
    {
      "subject": "Updated Subject",
      "content": "Updated content...",
      "delayDays": 0
    }
  ]
}
```

**Response:**
```json
{
  "success": true
}
```

**Endpoint:** `POST /api/sequences/start`

**Description:** Start a sequence for one or more contacts.

**Request Body:**
```json
{
  "sequenceId": "seq123456",
  "contactIds": ["contact123", "contact456"]
}
```

**Response:**
```json
{
  "success": true,
  "contactsCount": 2
}
```

### Team Collaboration

**Endpoint:** `POST /api/teams/invite`

**Description:** Invite a team member.

**Request Body:**
```json
{
  "email": "teammate@example.com",
  "role": "member"
}
```

**Response:**
```json
{
  "success": true,
  "invitationId": "inv123456"
}
```

**Endpoint:** `GET /api/teams/members`

**Description:** List team members.

**Response:**
```json
{
  "members": [
    {
      "id": "user123456",
      "email": "owner@example.com",
      "displayName": "Team Owner",
      "role": "owner",
      "joinedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": "user789012",
      "email": "member@example.com",
      "displayName": "Team Member",
      "role": "member",
      "joinedAt": "2023-01-02T00:00:00.000Z"
    }
  ],
  "pendingInvitations": [
    {
      "id": "inv123456",
      "email": "pending@example.com",
      "role": "member",
      "invitedBy": "user123456",
      "createdAt": "2023-01-03T00:00:00.000Z",
      "expiresAt": "2023-01-10T00:00:00.000Z"
    }
  ],
  "teamId": "team123456",
  "userRole": "owner"
}
```

**Endpoint:** `PUT /api/teams/permissions`

**Description:** Update team member permissions.

**Request Body:**
```json
{
  "memberId": "user789012",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true
}
```

### Notifications

**Endpoint:** `GET /api/notifications`

**Description:** Get user notifications.

**Query Parameters:**
- `limit` (optional): Number of notifications to return (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `unread` (optional): Filter to unread notifications only (default: false)

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif123456",
      "type": "credit_purchase",
      "title": "Credits Purchased",
      "message": "You purchased 100 credits",
      "read": false,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "unreadCount": 1,
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

**Endpoint:** `PUT /api/notifications/read`

**Description:** Mark notifications as read.

**Request Body:**
```json
{
  "notificationIds": ["notif123456", "notif789012"],
  "all": false
}
```

**Response:**
```json
{
  "success": true,
  "count": 2
}
```

**Endpoint:** `GET /api/notifications/settings`

**Description:** Get notification settings.

**Response:**
```json
{
  "settings": {
    "email": true,
    "push": true,
    "inApp": true,
    "types": {
      "credits": true,
      "contacts": true,
      "sequences": true,
      "team": true,
      "system": true
    }
  }
}
```

**Endpoint:** `POST /api/notifications/settings`

**Description:** Update notification settings.

**Request Body:**
```json
{
  "email": true,
  "push": false,
  "types": {
    "credits": true,
    "contacts": false
  }
}
```

**Response:**
```json
{
  "success": true
}
```

### File Storage

**Endpoint:** `POST /api/files/upload`

**Description:** Upload a file.

**Request Body:**
Multipart form data with a `file` field.

**Response:**
```json
{
  "id": "file123456",
  "name": "document.pdf",
  "type": "application/pdf",
  "size": 1024000,
  "url": "https://storage.example.com/files/document.pdf"
}
```

**Endpoint:** `GET /api/files/list`

**Description:** List user files.

**Query Parameters:**
- `limit` (optional): Number of files to return (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `type` (optional): Filter by file type

**Response:**
```json
{
  "files": [
    {
      "id": "file123456",
      "name": "document.pdf",
      "type": "application/pdf",
      "size": 1024000,
      "url": "https://storage.example.com/files/document.pdf",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

**Endpoint:** `DELETE /api/files/delete`

**Description:** Delete a file.

**Query Parameters:**
- `id`: File ID to delete

**Response:**
```json
{
  "success": true
}
```

### Reporting

**Endpoint:** `POST /api/reports/generate`

**Description:** Generate a report.

**Request Body:**
```json
{
  "type": "credits",
  "dateRange": {
    "start": "2023-01-01T00:00:00.000Z",
    "end": "2023-01-31T23:59:59.999Z"
  },
  "filters": {
    "service": "lead_lookup"
  }
}
```

**Response:**
```json
{
  "id": "report123456",
  "type": "credits",
  "dateRange": {
    "start": "2023-01-01T00:00:00.000Z",
    "end": "2023-01-31T23:59:59.999Z"
  },
  "data": {
    "usageByService": {
      "lead_lookup": 50,
      "email_verification": 25
    },
    "purchasesByMethod": {
      "paypal": 100
    },
    "dailyUsage": {
      "2023-01-01": {
        "usage": 10,
        "purchase": 0
      },
      "2023-01-02": {
        "usage": 15,
        "purchase": 100
      }
    },
    "totalUsage": 75,
    "totalPurchase": 100
  }
}
```

**Endpoint:** `GET /api/reports/export`

**Description:** Export a report.

**Query Parameters:**
- `id`: Report ID to export
- `format` (optional): Export format, either "json" or "csv" (default: "json")

**Response (JSON):**
Full report data as JSON.

**Response (CSV):**
CSV file download with report data.

### Webhooks

**Endpoint:** `POST /api/webhooks/register`

**Description:** Register a webhook endpoint.

**Request Body:**
```json
{
  "name": "My CRM Integration",
  "url": "https://example.com/webhook",
  "events": ["contact.created", "contact.updated"],
  "description": "Sync contacts with CRM"
}
```

**Response:**
```json
{
  "id": "webhook123456",
  "name": "My CRM Integration",
  "url": "https://example.com/webhook",
  "events": ["contact.created", "contact.updated"],
  "description": "Sync contacts with CRM",
  "secret": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "active": true
}
```

**Endpoint:** `GET /api/webhooks/list`

**Description:** List registered webhooks.

**Response:**
```json
{
  "webhooks": [
    {
      "id": "webhook123456",
      "name": "My CRM Integration",
      "url": "https://example.com/webhook",
      "events": ["contact.created", "contact.updated"],
      "description": "Sync contacts with CRM",
      "secretPreview": "a1b2...o5p6",
      "active": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

**Endpoint:** `POST /api/webhooks/test`

**Description:** Test a webhook delivery.

**Request Body:**
```json
{
  "webhookId": "webhook123456",
  "event": "contact.created"
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "response": {
    "received": true
  }
}
```

## Error Handling

All API endpoints return standard HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient credits or permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include an error message:

```json
{
  "error": "Insufficient lead lookup credits"
}
```

## Rate Limits

API requests are limited to 100 requests per minute per user. Exceeding this limit will result in a `429 Too Many Requests` response.

## Credit System

Each API request consumes credits based on the service used. Credits are deducted from the user's account after each successful request. If the user doesn't have enough credits, the request will fail with a `403 Forbidden` response.

## Testing

For testing purposes, you can use the sandbox environment at `https://sandbox.opulflow.com/api`. The sandbox environment doesn't consume real credits and returns mock data.