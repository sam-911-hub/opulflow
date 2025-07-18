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