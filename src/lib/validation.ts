// Input validation and sanitization utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: any;
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
    return { isValid: false, errors };
  }

  const trimmedEmail = email.trim().toLowerCase();
  
  if (trimmedEmail.length === 0) {
    errors.push('Email cannot be empty');
  } else if (trimmedEmail.length > 254) {
    errors.push('Email is too long (max 254 characters)');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.push('Invalid email format');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: trimmedEmail
  };
}

// Domain validation
export function validateDomain(domain: string): ValidationResult {
  const errors: string[] = [];
  
  if (!domain || typeof domain !== 'string') {
    errors.push('Domain is required');
    return { isValid: false, errors };
  }

  const trimmedDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  if (trimmedDomain.length === 0) {
    errors.push('Domain cannot be empty');
  } else if (trimmedDomain.length > 253) {
    errors.push('Domain is too long (max 253 characters)');
  } else if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/.test(trimmedDomain)) {
    errors.push('Invalid domain format');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: trimmedDomain
  };
}

// LinkedIn URL validation
export function validateLinkedInUrl(url: string): ValidationResult {
  const errors: string[] = [];
  
  if (!url || typeof url !== 'string') {
    errors.push('LinkedIn URL is required');
    return { isValid: false, errors };
  }

  const trimmedUrl = url.trim();
  
  if (trimmedUrl.length === 0) {
    errors.push('LinkedIn URL cannot be empty');
  } else if (trimmedUrl.length > 2048) {
    errors.push('URL is too long (max 2048 characters)');
  } else if (!/^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(trimmedUrl)) {
    errors.push('Invalid LinkedIn profile URL format. Expected: https://linkedin.com/in/profile-name');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: trimmedUrl.replace(/\/$/, '') // Remove trailing slash
  };
}

// Name validation
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  const errors: string[] = [];
  
  if (!name || typeof name !== 'string') {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length === 0) {
    errors.push(`${fieldName} cannot be empty`);
  } else if (trimmedName.length > 100) {
    errors.push(`${fieldName} is too long (max 100 characters)`);
  } else if (!/^[a-zA-Z\s\-\.\']+$/.test(trimmedName)) {
    errors.push(`${fieldName} contains invalid characters. Only letters, spaces, hyphens, periods, and apostrophes are allowed`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: trimmedName
  };
}

// Generic string sanitization
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>\"'&]/g, '') // Remove potential XSS characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

// Batch email validation for email verifier
export function validateEmailBatch(emails: string[]): ValidationResult {
  const errors: string[] = [];
  const sanitized: string[] = [];
  
  if (!Array.isArray(emails)) {
    errors.push('Emails must be an array');
    return { isValid: false, errors };
  }

  if (emails.length === 0) {
    errors.push('At least one email is required');
    return { isValid: false, errors };
  }

  if (emails.length > 50) {
    errors.push('Too many emails (max 50 per batch)');
    return { isValid: false, errors };
  }

  for (let i = 0; i < emails.length; i++) {
    const emailValidation = validateEmail(emails[i]);
    if (!emailValidation.isValid) {
      errors.push(`Email ${i + 1}: ${emailValidation.errors.join(', ')}`);
    } else {
      sanitized.push(emailValidation.sanitized);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

// Lead search form validation
export function validateLeadSearchForm(form: any): ValidationResult {
  const errors: string[] = [];
  const sanitized: any = {};

  // At least one field must be provided
  if (!form.email && !form.name && !form.company && !form.domain && !form.linkedinUrl) {
    errors.push('At least one search parameter is required (email, name, company, domain, or LinkedIn URL)');
    return { isValid: false, errors };
  }

  // Validate individual fields if provided
  if (form.email) {
    const emailValidation = validateEmail(form.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors.map(e => `Email: ${e}`));
    } else {
      sanitized.email = emailValidation.sanitized;
    }
  }

  if (form.name) {
    const nameValidation = validateName(form.name, 'Name');
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    } else {
      sanitized.name = nameValidation.sanitized;
    }
  }

  if (form.company) {
    const companyValidation = validateName(form.company, 'Company');
    if (!companyValidation.isValid) {
      errors.push(...companyValidation.errors);
    } else {
      sanitized.company = companyValidation.sanitized;
    }
  }

  if (form.domain) {
    const domainValidation = validateDomain(form.domain);
    if (!domainValidation.isValid) {
      errors.push(...domainValidation.errors.map(e => `Domain: ${e}`));
    } else {
      sanitized.domain = domainValidation.sanitized;
    }
  }

  if (form.linkedinUrl) {
    const urlValidation = validateLinkedInUrl(form.linkedinUrl);
    if (!urlValidation.isValid) {
      errors.push(...urlValidation.errors.map(e => `LinkedIn URL: ${e}`));
    } else {
      sanitized.linkedinUrl = urlValidation.sanitized;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}