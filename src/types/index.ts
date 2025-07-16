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

// Credit System Types
export type CreditType = 'ai' | 'leads' | 'enrichment' | 'company' | 'email' | 'workflow' | 'crm';

export interface CreditPackage {
  id: string;
  type: CreditType;
  amount: number;
  price: number;
  description: string;
  featured?: boolean;
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

// Service Limits
export interface ServiceLimits {
  leads: number; // per month
  enrichment: number; // per month
  company: number; // per month
  emailSequences: number; // templates
  workflowRuns: number; // per month
  aiCredits: number; // per month
  emailWriter: number; // per month
  callScripts: number; // per month
  meetingNotes: boolean;
  userSeats: number;
  sharedWorkspace: boolean;
}

// Pricing Tiers
export const PRICING_TIERS = {
  free: {
    name: 'Free Forever',
    price: 0,
    limits: {
      leads: 500,
      enrichment: 50,
      company: 0, // Basic info only
      emailSequences: 3,
      workflowRuns: 5,
      aiCredits: 0,
      emailWriter: 10,
      callScripts: 5,
      meetingNotes: false,
      userSeats: 1,
      sharedWorkspace: false
    } as ServiceLimits
  },
  pro: {
    name: 'Pro',
    price: 29,
    limits: {
      leads: -1, // Unlimited
      enrichment: -1, // Unlimited
      company: -1, // Full technographics
      emailSequences: -1, // Unlimited
      workflowRuns: -1, // Unlimited
      aiCredits: 10000,
      emailWriter: -1, // Unlimited
      callScripts: -1, // Unlimited
      meetingNotes: true,
      userSeats: 1, // +$10 per additional
      sharedWorkspace: true
    } as ServiceLimits
  }
};

// PAYG Credit Packages
export const creditPackages: CreditPackage[] = [
  {
    id: 'ai-starter',
    type: 'ai',
    amount: 100,
    price: 10,
    description: 'AI Starter',
    featured: true
  },
  {
    id: 'lead-explorer',
    type: 'leads',
    amount: 500,
    price: 15,
    description: 'Lead Explorer',
    featured: true
  },
  {
    id: 'power-bundle-ai',
    type: 'ai',
    amount: 5000,
    price: 50,
    description: 'Power Bundle (AI)',
    featured: true
  },
  {
    id: 'power-bundle-leads',
    type: 'leads',
    amount: 2000,
    price: 50,
    description: 'Power Bundle (Leads)',
    featured: true
  },
  {
    id: 'enrichment-pack',
    type: 'enrichment',
    amount: 100,
    price: 10,
    description: 'Contact Enrichment'
  },
  {
    id: 'company-data',
    type: 'company',
    amount: 100,
    price: 20,
    description: 'Company Profiles'
  },
  {
    id: 'email-pack',
    type: 'email',
    amount: 100,
    price: 5,
    description: 'Email Sequences'
  },
  {
    id: 'workflow-pack',
    type: 'workflow',
    amount: 100,
    price: 100,
    description: 'Workflow Runs'
  },
  {
    id: 'crm-sync',
    type: 'crm',
    amount: 1,
    price: 10,
    description: 'CRM Integration'
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