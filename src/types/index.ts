export interface APIKey {
  id: string;
  service: 'openai' | 'salesforce' | 'hubspot' | 'zapier';
  key: string;
  createdAt: string;
  lastUsed?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  title?: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  lastContacted?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  accountType: 'free' | 'pro';
  credits: {
    ai: number;
    leads: number;
    enrichment: number;
    company: number;
    email: number;
    workflow: number;
    crm: number;
  };
  usage: {
    leads: number; // monthly usage
    enrichment: number; // monthly usage
    workflowRuns: number; // monthly usage
    emailWriter: number; // monthly usage
    callScripts: number; // monthly usage
  };
  teamMembers?: string[];
  additionalSeats?: number;
}

// CRM Integration Types
export interface CRMIntegration {
  id: string;
  provider: 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho' | 'custom';
  name: string;
  status: 'active' | 'inactive' | 'pending';
  lastSync?: string;
  apiKey?: string;
  webhookUrl?: string;
  mappings?: Record<string, string>;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  userId: string;
  metadata?: Record<string, any>;
}

// Workflow Types
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  n8nId: string;
  creditCost: number;
  requiredCredits: string;
  category: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  daysAfter: number;
  isAIEnhanced: boolean;
  variables: string[];
}

// Credit System Types
export type CreditType = 
  // Core Services
  'lead_lookup' | 
  'company_enrichment' | 
  'email_verification' | 
  'ai_email' | 
  'workflow' | 
  'crm_sync' |
  // CRM Light
  'lead_tracking' |
  'pipeline' |
  'report' |
  // Email Automation
  'email_personalization' |
  'email_sequence' |
  'email_tracking' |
  // Lead Scoring
  'tech_detection' |
  'intent_signals' |
  'lead_ranking' |
  // Chrome Extension
  'extension_access' |
  'contact_lookup' |
  // AI Coach
  'script_help' |
  'call_analysis' |
  // Analytics
  'source_tracking' |
  'roi_report';

export interface CreditPackage {
  id: string;
  type: CreditType;
  amount: number;
  price: number;
  description: string;
  featured?: boolean;
  includes?: Record<string, number>; // For bundles with multiple credit types
}

export interface CreditTransaction {
  id: string;
  type: 'purchase' | 'consumption';
  amount: number;
  service: CreditType;
  createdAt: string;
  remainingBalance: number;
  description?: string;
}

// Credit Expiration
export interface CreditExpiration {
  creditId: string;
  userId: string;
  expiresAt: string; // ISO date string
  amount: number;
  type: CreditType;
  used: number;
  remaining: number;
}

// Service Pricing
export const SERVICE_PRICING: Record<CreditType, { cost: number; price: number; description: string }> = {
  // Core Services
  lead_lookup: { cost: 0.10, price: 0.25, description: 'Lead Lookup' },
  company_enrichment: { cost: 0.15, price: 0.35, description: 'Company Enrichment' },
  email_verification: { cost: 0.008, price: 0.05, description: 'Email Verification' },
  ai_email: { cost: 0.02, price: 0.10, description: 'AI Email Generation' },
  workflow: { cost: 0.001, price: 0.05, description: 'Workflow Execution' },
  crm_sync: { cost: 0, price: 10, description: 'CRM Sync Setup' },
  
  // CRM Light
  lead_tracking: { cost: 0.001, price: 0.05, description: 'Lead Tracking' },
  pipeline: { cost: 0, price: 10, description: 'Pipeline Management' },
  report: { cost: 0.01, price: 2, description: 'Basic Reporting' },
  
  // Email Automation
  email_personalization: { cost: 0.03, price: 0.15, description: 'AI Personalization' },
  email_sequence: { cost: 0.001, price: 0.05, description: 'Sequence Automation' },
  email_tracking: { cost: 0.002, price: 0.10, description: 'Deliverability Tracking' },
  
  // Lead Scoring
  tech_detection: { cost: 0.05, price: 0.20, description: 'Tech Stack Detection' },
  intent_signals: { cost: 0.10, price: 0.30, description: 'Intent Signals' },
  lead_ranking: { cost: 0.02, price: 0.10, description: 'Priority Ranking' },
  
  // Chrome Extension
  extension_access: { cost: 0, price: 10, description: 'Browser Access' },
  contact_lookup: { cost: 0.05, price: 0.25, description: 'Auto-Lookup Contacts' },
  
  // AI Coach
  script_help: { cost: 0.05, price: 0.25, description: 'Script Help' },
  call_analysis: { cost: 0.10, price: 0.50, description: 'Call Analysis' },
  
  // Analytics
  source_tracking: { cost: 0.001, price: 0.05, description: 'Source Tracking' },
  roi_report: { cost: 0, price: 15, description: 'ROI Calculator' }
};

// PAYG Credit Packages
export const creditPackages: CreditPackage[] = [
  // Core Credit Packs
  {
    id: 'starter-pack',
    type: 'lead_lookup',
    amount: 40,
    price: 10,
    description: 'Starter Pack',
    featured: true
  },
  {
    id: 'lead-explorer',
    type: 'lead_lookup',
    amount: 200,
    price: 45,
    description: 'Lead Explorer',
    featured: true
  },
  {
    id: 'enrichment-pack',
    type: 'company_enrichment',
    amount: 100,
    price: 30,
    description: 'Enrichment Pack'
  },
  {
    id: 'email-verification',
    type: 'email_verification',
    amount: 1000,
    price: 45,
    description: 'Email Verification'
  },
  {
    id: 'ai-writer',
    type: 'ai_email',
    amount: 200,
    price: 20,
    description: 'AI Email Writer'
  },
  {
    id: 'workflow-automation',
    type: 'workflow',
    amount: 200,
    price: 10,
    description: 'Workflow Automation'
  },
  
  // Bundle Packs
  {
    id: 'crm-light-bundle',
    type: 'lead_tracking',
    amount: 1,
    price: 20,
    description: 'CRM Light Bundle',
    featured: true,
    includes: {
      lead_tracking: 1000, // Unlimited leads
      pipeline: 5,         // 5 pipelines
      report: 10           // 10 reports
    }
  },
  {
    id: 'email-bundle',
    type: 'email_personalization',
    amount: 1,
    price: 50,
    description: 'Email Automation Bundle',
    featured: true,
    includes: {
      email_personalization: 500,
      email_sequence: 500,
      email_tracking: 500
    }
  },
  {
    id: 'lead-scoring-bundle',
    type: 'tech_detection',
    amount: 1,
    price: 100,
    description: 'Lead Scoring Bundle',
    includes: {
      tech_detection: 1000,
      intent_signals: 1000,
      lead_ranking: 1000
    }
  },
  {
    id: 'sales-coach-bundle',
    type: 'script_help',
    amount: 1,
    price: 30,
    description: 'AI Sales Coach Bundle',
    includes: {
      script_help: 1000,    // Unlimited queries
      call_analysis: 60     // 60 minutes
    }
  },
  {
    id: 'analytics-bundle',
    type: 'source_tracking',
    amount: 1,
    price: 25,
    description: 'Analytics Bundle',
    includes: {
      source_tracking: 1000, // Unlimited tracking
      roi_report: 5          // 5 reports
    }
  },
  
  // Extension Access
  {
    id: 'chrome-extension',
    type: 'extension_access',
    amount: 1,
    price: 10,
    description: 'Chrome Extension (Monthly)'
  }
];

// Workflow Templates (Day 5 Addition)
export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'lead-enrichment',
    name: 'Lead Enrichment',
    description: 'Automatically enrich leads with company data',
    icon: '🔍',
    n8nId: 'template-123',
    creditCost: 5,
    requiredCredits: 'leads',
    category: 'Leads'
  },
  {
    id: 'email-sequence',
    name: 'Email Sequence',
    description: 'Send personalized follow-up emails',
    icon: '✉️',
    n8nId: 'template-456',
    creditCost: 10,
    requiredCredits: 'ai',
    category: 'Communication'
  },
  {
    id: 'data-export',
    name: 'Data Export',
    description: 'Automatically export leads to CSV',
    icon: '📤',
    n8nId: 'template-789',
    creditCost: 3,
    requiredCredits: 'exports',
    category: 'Data'
  }
];

// Default Email Templates (Day 5 Addition)
export const defaultEmailTemplates: EmailTemplate[] = [
  {
    id: 'followup-1',
    name: 'Initial Follow-Up',
    subject: 'Following up on our conversation',
    body: 'Hi {firstName},\n\nJust wanted to follow up...',
    daysAfter: 2,
    isAIEnhanced: true,
    variables: ['firstName', 'company']
  },
  {
    id: 'value-proposition',
    name: 'Value Proposition',
    subject: 'How we can help {company}',
    body: 'Hello {firstName},\n\nAt {company}, we understand...',
    daysAfter: 5,
    isAIEnhanced: true,
    variables: ['firstName', 'company', 'industry']
  },
  {
    id: 'thank-you',
    name: 'Thank You',
    subject: 'Thank you for your time',
    body: 'Dear {firstName},\n\nThank you for...',
    daysAfter: 1,
    isAIEnhanced: false,
    variables: ['firstName']
  }
];

// Pricing Tiers
export const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    description: 'For individuals and small teams',
    limits: {
      leads: 500,
      enrichment: 50,
      workflowRuns: 5,
      emailWriter: 10,
      callScripts: 5,
      emailTemplates: 3,
      teamMembers: 1
    }
  },
  pro: {
    name: 'Pro',
    price: 29,
    description: 'For growing teams',
    limits: {
      leads: -1, // Unlimited
      enrichment: -1, // Unlimited
      workflowRuns: -1, // Unlimited
      emailWriter: 10000,
      callScripts: -1, // Unlimited
      emailTemplates: -1, // Unlimited
      teamMembers: 5
    }
  }
};

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  service: CreditType;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User Session Types
export interface UserSession {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  accountType: 'free' | 'pro';
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Error Types
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  details?: any;
}