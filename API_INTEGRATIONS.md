# OpulFlow API Integrations - New Services

This document outlines the newly integrated API services that are now accessible through the OpulFlow platform.

## 🆕 Newly Integrated APIs

### 1. DeepAI Integration ✅
**API Key:** `49284644-89a8-4717-9e17-ddcaa66fb4f1`

#### Text Generation Service
- **Endpoint:** `POST /api/deepai/text-generation`
- **Cost:** $0.10 per generation (1 credit)
- **Features:**
  - AI-powered text completion and generation
  - Multiple models available
  - Customizable parameters (temperature, max length)
  
**Example Request:**
```json
{
  "text": "Write a professional email about...",
  "model": "text-generator",
  "maxLength": 500,
  "temperature": 0.7
}
```

#### Image Generation Service
- **Endpoint:** `POST /api/deepai/image-generation`
- **Cost:** $0.20 per image (2 credits)
- **Features:**
  - Text-to-image generation
  - Multiple AI models (text2img, stable-diffusion, etc.)
  - Customizable dimensions and styles
  
**Example Request:**
```json
{
  "text": "A beautiful sunset over mountains with a lake",
  "model": "text2img",
  "width": 512,
  "height": 512,
  "style": "photorealistic"
}
```

### 2. HubSpot CRM Integration ✅
**Access Token:** `pat-eu1-87f46f2f-f4a7-44fe-acb5-3bf5ae87e725`

#### Contacts Management
- **Create Contact:** `POST /api/hubspot/contacts`
- **Search Contacts:** `GET /api/hubspot/contacts?email=example@domain.com`
- **Cost:** $0.15 per creation, $0.10 per search

**Create Contact Example:**
```json
{
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Example Corp",
  "phone": "+1234567890",
  "jobTitle": "Software Engineer",
  "leadStatus": "new",
  "lifecycleStage": "lead"
}
```

#### Companies Management
- **Create Company:** `POST /api/hubspot/companies`
- **Search Companies:** `GET /api/hubspot/companies?domain=example.com`
- **Cost:** $0.15 per creation, $0.10 per search

**Create Company Example:**
```json
{
  "name": "Example Corporation",
  "domain": "example.com",
  "industry": "Technology",
  "description": "A leading tech company",
  "employees": 500,
  "annualRevenue": 10000000,
  "city": "San Francisco",
  "state": "CA",
  "country": "United States"
}
```

### 3. BuiltWith Technology Analysis ✅
**API Key:** `59ecad46-f475-4665-83af-387586b672e5`

#### Website Technology Stack Analysis
- **Endpoint:** `POST /api/builtwith/tech-lookup`
- **Base Cost:** $0.25 per lookup (1 credit)
- **Add-ons:**
  - Historical data: +$0.25 (1 credit)
  - Demographics: +$0.50 (2 credits)
  - Spend data: +$0.50 (2 credits)

**Example Request:**
```json
{
  "domain": "example.com",
  "includeHistorical": false,
  "includeTechnographics": false,
  "includeSpend": false
}
```

**Features:**
- Current technology stack detection
- Historical technology usage tracking
- Technographic insights
- Technology spend estimates
- Categorized technology breakdown

## 📋 Previously Integrated APIs (Already Working)

### ✅ Apify Integration
- Company enrichment and lead lookup services
- LinkedIn data scraping capabilities

### ✅ Hunter.io Integration  
- Email finding and verification services
- Professional email intelligence

### ✅ Brevo Integration
- Email delivery and analytics services
- Professional email marketing tools

## 🔧 Technical Implementation Details

### Authentication
All new APIs use the existing session-based authentication system:
```javascript
const sessionCookie = request.cookies.get('session')?.value;
const decodedClaims = await verifySessionCookie(sessionCookie);
```

### Credit System Integration
Each service integrates with the existing credit system:
- **AI Generation:** Uses `ai_generation` credit type
- **CRM Integration:** Uses `crm_integration` credit type  
- **Technology Analysis:** Uses `tech_analysis` credit type

### Rate Limiting
New services have appropriate rate limits:
- **Text Generation:** 30 requests/minute
- **Image Generation:** 15 requests/minute
- **CRM Integration:** 25 requests/minute
- **Tech Analysis:** 10 requests/5 minutes

### Error Handling
All endpoints follow the same error handling pattern:
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "service": "Service name"
}
```

### Transaction Logging
Every API call is logged for tracking and billing:
```javascript
await db.collection(`users/${userId}/transactions`).add({
  type: 'usage',
  service: 'service_name',
  subService: 'specific_action',
  amount: creditsUsed,
  cost: dollarAmount,
  provider: 'Provider Name',
  // ... other metadata
  createdAt: new Date().toISOString(),
  remainingBalance: remainingCredits
});
```

## 🚀 Getting Started

### 1. Service Discovery
Get an overview of all available services:
```bash
GET /api/services
```

### 2. Check Individual Service Info
Each service provides documentation via GET requests:
```bash
GET /api/deepai/text-generation
GET /api/hubspot/contacts  
GET /api/builtwith/tech-lookup
```

### 3. Authentication Required
All endpoints require valid session authentication. Users must:
1. Log into OpulFlow
2. Have sufficient credits for the service
3. Stay within rate limits

### 4. Monitor Usage
Users can track their API usage through:
- Credit balance monitoring
- Transaction history
- Cost tracking logs

## 💡 Integration Benefits

### For Developers
- **Consistent API patterns** across all services
- **Unified authentication** system
- **Comprehensive error handling**
- **Built-in rate limiting** and cost tracking

### For Business Users
- **Single platform** for multiple API services
- **Unified billing** through credit system
- **Professional grade** integrations
- **Detailed usage analytics**

## 🔍 Service Status

| Service | Status | Endpoints | Credit Types |
|---------|--------|-----------|--------------|
| DeepAI | ✅ Active | Text & Image Generation | `ai_generation` |
| HubSpot | ✅ Active | Contacts & Companies | `crm_integration` |
| BuiltWith | ✅ Active | Technology Analysis | `tech_analysis` |
| Apify | ✅ Active | Company Enrichment | `company_enrichment` |
| Hunter.io | ✅ Active | Email Services | `email_verification` |
| Brevo | ✅ Active | Email Delivery | `email_delivery` |

## 📞 Support

For technical support or questions about these integrations:
1. Check the service documentation: `GET /api/services`
2. Monitor service health: `GET /api/health`
3. Contact support through the OpulFlow dashboard

---

**Last Updated:** $(date)
**Integration Status:** All services fully operational
**Next Review:** Monthly integration health check