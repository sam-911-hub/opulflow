import { toast } from "sonner";

// Error types
export enum ErrorType {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NETWORK = "network",
  SERVER = "server",
  VALIDATION = "validation",
  CREDIT = "credit",
  UNKNOWN = "unknown"
}

// Error interface
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  originalError?: any;
}

// Error handler
export const handleError = (error: any, defaultMessage = "An error occurred"): AppError => {
  console.error("Error:", error);
  
  // Firebase auth errors
  if (error?.code?.startsWith('auth/')) {
    const message = getAuthErrorMessage(error.code);
    toast.error(message);
    return {
      type: ErrorType.AUTHENTICATION,
      message,
      code: error.code,
      originalError: error
    };
  }
  
  // Firebase Firestore errors
  if (error?.code?.startsWith('firestore/')) {
    const message = getFirestoreErrorMessage(error.code);
    toast.error(message);
    return {
      type: ErrorType.SERVER,
      message,
      code: error.code,
      originalError: error
    };
  }
  
  // Network errors
  if (error instanceof TypeError && error.message.includes('network')) {
    const message = "Network error. Please check your connection.";
    toast.error(message);
    return {
      type: ErrorType.NETWORK,
      message,
      originalError: error
    };
  }
  
  // Credit errors
  if (error?.message?.includes('credit') || error?.message?.includes('insufficient')) {
    const message = error.message || "Insufficient credits";
    toast.error(message);
    return {
      type: ErrorType.CREDIT,
      message,
      originalError: error
    };
  }
  
  // Default error
  toast.error(error?.message || defaultMessage);
  return {
    type: ErrorType.UNKNOWN,
    message: error?.message || defaultMessage,
    originalError: error
  };
};

// Get user-friendly auth error messages
const getAuthErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/user-not-found':
      return "No account found with this email address";
    case 'auth/wrong-password':
      return "Incorrect password";
    case 'auth/email-already-in-use':
      return "This email is already in use";
    case 'auth/weak-password':
      return "Password is too weak";
    case 'auth/invalid-email':
      return "Invalid email address";
    case 'auth/account-exists-with-different-credential':
      return "An account already exists with a different sign-in method";
    case 'auth/operation-not-allowed':
      return "This sign-in method is not enabled";
    case 'auth/requires-recent-login':
      return "Please sign in again to complete this action";
    default:
      return "Authentication error";
  }
};

// Get user-friendly Firestore error messages
const getFirestoreErrorMessage = (code: string): string => {
  switch (code) {
    case 'firestore/permission-denied':
      return "You don't have permission to access this resource";
    case 'firestore/not-found':
      return "The requested document was not found";
    case 'firestore/already-exists':
      return "The document already exists";
    case 'firestore/cancelled':
      return "The operation was cancelled";
    case 'firestore/data-loss':
      return "Data loss or corruption";
    case 'firestore/deadline-exceeded':
      return "Operation timed out";
    case 'firestore/failed-precondition':
      return "Operation failed due to system state";
    case 'firestore/aborted':
      return "Operation aborted";
    case 'firestore/out-of-range':
      return "Operation attempted past valid range";
    case 'firestore/unimplemented':
      return "Operation not implemented";
    case 'firestore/internal':
      return "Internal server error";
    case 'firestore/unavailable':
      return "Service unavailable";
    case 'firestore/unauthenticated':
      return "Unauthenticated request";
    default:
      return "Database error";
  }
};

// Retry function with exponential backoff
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
  backoffFactor = 2
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry certain errors
      if (
        error?.code?.startsWith('auth/') ||
        error?.code === 'firestore/permission-denied' ||
        error?.message?.includes('insufficient')
      ) {
        throw error;
      }
      
      // Wait before retrying
      if (attempt < maxRetries - 1) {
        const waitTime = delay * Math.pow(backoffFactor, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
};

// Validate input
export const validateInput = (input: any, rules: Record<string, (value: any) => boolean | string>): string[] => {
  const errors: string[] = [];
  
  for (const [field, validator] of Object.entries(rules)) {
    const result = validator(input[field]);
    
    if (result !== true) {
      errors.push(typeof result === 'string' ? result : `Invalid ${field}`);
    }
  }
  
  return errors;
};