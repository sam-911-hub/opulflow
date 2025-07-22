// Core interfaces for OpulFlow application

export type CreditType = 
  // Core Services
  'lead_lookup' | 
  'company_enrichment' | 
  'email_verification' | 
  'email_finder' |
  'email_delivery' |
  'whatsapp_messages' |
  'sms_messages' |
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
  'roi_report' |
  // Legacy types
  'ai' |
  'leads' |
  'exports';

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  title?: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  emailVerified?: boolean;
  emailVerifiedAt?: string;
  enriched?: boolean;
  enrichedAt?: string;
  enrichmentData?: CompanyEnrichmentData;
  lastContacted?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CompanyEnrichmentData {
  industry?: string;
  size?: string;
  founded?: number;
  location?: string;
  revenue?: string;
  website?: string;
  technologies?: string[];
}

export interface Pipeline {
  id: string;
  name: string;
  stages: string[];
  deals: Deal[];
  createdAt: string;
  updatedAt?: string;
}

export interface Deal {
  leadId: string;
  leadName: string;
  company: string;
  stage: string;
  value: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TechDetection {
  domain: string;
  detectedAt: string;
  techCategories: TechCategory[];
}

export interface TechCategory {
  category: string;
  technologies: Technology[];
}

export interface Technology {
  name: string;
  confidence: number;
}

export interface ROICalculation {
  campaignName: string;
  leadsGenerated: number;
  conversionRate: number;
  averageDealSize: number;
  costPerLead: number;
  salesCycleMonths: number;
  closingCosts: number;
  metrics: {
    totalLeads: number;
    conversions: number;
    totalRevenue: number;
    leadCost: number;
    closingCost: number;
    totalCost: number;
    profit: number;
    roi: number;
    monthlyRevenue: number;
  };
  calculatedAt: string;
}

export interface EmailDelivery {
  id: string;
  subject: string;
  recipient: string;
  sentAt: string;
  opened: boolean;
  openedAt?: string;
  clicked: boolean;
  clickedAt?: string;
  replied: boolean;
  repliedAt?: string;
  bounced: boolean;
  bouncedReason?: string;
}

export interface EmailSequence {
  id: string;
  name: string;
  emails: number;
  active: boolean;
  createdAt: string;
  lastSent: string | null;
}

export interface CRMIntegration {
  id: string;
  provider: 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho' | 'custom';
  apiKey?: string;
  refreshToken?: string;
  lastSynced?: string;
  status: 'active' | 'inactive' | 'error';
  errorMessage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LeadSource {
  id: string;
  name: string;
  medium: string;
  campaign?: string;
  leadCount: number;
  conversionRate: number;
  createdAt: string;
}

export interface CallAnalysis {
  id: string;
  callId: string;
  duration: number;
  transcript?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  insights: string[];
  createdAt: string;
}

export interface IntentSignal {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  signalType: 'website_visit' | 'content_download' | 'email_open' | 'pricing_page' | 'demo_request';
  strength: number; // 0-100
  detectedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  accountType: 'free' | 'pro';
  role: 'owner' | 'admin' | 'member';
  credits: Record<string, number>;
  usage: {
    leads: number;
    enrichment: number;
    workflowRuns: number;
    emailWriter: number;
    callScripts: number;
  };
  createdAt: string;
  lastLogin?: string;
}