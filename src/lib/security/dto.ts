import { z } from 'zod';

// Auth DTOs
export const LoginDTO = z.object({
  idToken: z.string().min(1, 'ID token is required'),
});

export const RegisterDTO = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

// Lead Lookup DTOs
export const LeadLookupDTO = z.object({
  email: z.string().email('Invalid email format').optional(),
  domain: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
}).refine(data => data.email || data.domain || data.name || data.company, {
  message: 'At least one search parameter is required',
});

export const BulkLeadLookupDTO = z.object({
  leads: z.array(LeadLookupDTO).min(1).max(100, 'Maximum 100 leads per request'),
});

// Company Enrichment DTOs
export const CompanyEnrichDTO = z.object({
  domain: z.string().min(1, 'Domain is required'),
});

// Email Verification DTOs
export const EmailVerifyDTO = z.object({
  email: z.string().email('Invalid email format'),
});

// AI Generation DTOs
export const AIGenerateDTO = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(2000, 'Prompt too long'),
  type: z.enum(['email', 'script', 'message']),
  context: z.record(z.any()).optional(),
});

// Credit Management DTOs
export const AssignCreditsDTO = z.object({
  userId: z.string().min(1, 'User ID is required'),
  credits: z.object({
    leads: z.number().int().min(0).optional(),
    companies: z.number().int().min(0).optional(),
    emails: z.number().int().min(0).optional(),
    ai: z.number().int().min(0).optional(),
    techstack: z.number().int().min(0).optional(),
    intent: z.number().int().min(0).optional(),
    calls: z.number().int().min(0).optional(),
    crm: z.number().int().min(0).optional(),
    workflows: z.number().int().min(0).optional(),
  }),
});

// Payment DTOs
export const PayPalCreateOrderDTO = z.object({
  amount: z.number().positive('Amount must be positive').max(10000, 'Amount too large'),
  currency: z.string().length(3, 'Invalid currency code'),
});

export const MpesaPaymentDTO = z.object({
  phoneNumber: z.string().regex(/^254\d{9}$/, 'Invalid phone number format'),
  amount: z.number().positive().min(1).max(150000),
});

// Contact Management DTOs
export const CreateContactDTO = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  position: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

export const UpdateContactDTO = CreateContactDTO.partial();

// Team Management DTOs
export const InviteTeamMemberDTO = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'member', 'viewer']),
});

// Workflow DTOs
export const CreateWorkflowDTO = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  trigger: z.string().min(1),
  actions: z.array(z.any()).min(1),
});

// Email Sequence DTOs
export const CreateSequenceDTO = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  emails: z.array(z.object({
    subject: z.string().min(1).max(200),
    body: z.string().min(1).max(5000),
    delayDays: z.number().int().min(0).max(365),
  })).min(1).max(20),
});

// Pagination DTO
export const PaginationDTO = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Export types
export type LoginInput = z.infer<typeof LoginDTO>;
export type RegisterInput = z.infer<typeof RegisterDTO>;
export type LeadLookupInput = z.infer<typeof LeadLookupDTO>;
export type BulkLeadLookupInput = z.infer<typeof BulkLeadLookupDTO>;
export type CompanyEnrichInput = z.infer<typeof CompanyEnrichDTO>;
export type EmailVerifyInput = z.infer<typeof EmailVerifyDTO>;
export type AIGenerateInput = z.infer<typeof AIGenerateDTO>;
export type AssignCreditsInput = z.infer<typeof AssignCreditsDTO>;
export type PayPalCreateOrderInput = z.infer<typeof PayPalCreateOrderDTO>;
export type MpesaPaymentInput = z.infer<typeof MpesaPaymentDTO>;
export type CreateContactInput = z.infer<typeof CreateContactDTO>;
export type UpdateContactInput = z.infer<typeof UpdateContactDTO>;
export type InviteTeamMemberInput = z.infer<typeof InviteTeamMemberDTO>;
export type CreateWorkflowInput = z.infer<typeof CreateWorkflowDTO>;
export type CreateSequenceInput = z.infer<typeof CreateSequenceDTO>;
export type PaginationInput = z.infer<typeof PaginationDTO>;
