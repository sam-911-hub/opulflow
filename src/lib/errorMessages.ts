/**
 * Utility function to convert technical errors to user-friendly messages
 * Used throughout the app to hide developer details from users
 */

export function getUserFriendlyErrorMessage(error: any): string {
  // Handle Firebase Auth errors
  if (error?.code) {
    const code = error.code;

    switch (code) {
      case 'auth/user-not-found':
        return 'No account found with this email. Sign up first.';
      case 'auth/wrong-password':
        return 'Wrong password. Please try again.';
      case 'auth/invalid-login-credentials':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'Email already exists. Log in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network issue. Check your connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait and try again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Contact support.';
      case 'auth/requires-recent-login':
        return 'Please log in again to continue.';
      default:
        if (code.startsWith('auth/')) {
          return 'Login failed. Please check your credentials and try again.';
        }
    }
  }

  // Handle network errors
  if (error?.message) {
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch') || message.includes('internet')) {
      return 'Network issue. Check your connection and try again.';
    }
    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (message.includes('database') || message.includes('firestore')) {
      return 'Database error. Please try again.';
    }
    if (message.includes('payment') || message.includes('stripe') || message.includes('paypal')) {
      return 'Payment processing failed. Please try again or contact support.';
    }
    if (message.includes('mail') || message.includes('email')) {
      return 'Email sending failed. Please try again.';
    }
  }

  // Handle HTTP status codes
  if (error?.status) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'Access denied. Contact support if you believe this is an error.';
      case 404:
        return 'Resource not found. Please try again.';
      case 429:
        return 'Too many requests. Please wait and try again.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Server error. Our team has been notified. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  // Generic fallback for any other error
  return 'Something went wrong. Our team has been notified. Please try again later.';
}

/**
 * Sanitizes error messages to remove technical details
 */
export function sanitizeErrorMessage(message: string): string {
  if (!message) return 'Something went wrong. Please try again.';

  // Remove technical patterns
  const sanitized = message
    .replace(/Error: /gi, '')
    .replace(/TypeError: /gi, '')
    .replace(/ReferenceError: /gi, '')
    .replace(/SyntaxError: /gi, '')
    .replace(/RangeError: /gi, '')
    .replace(/URIError: /gi, '')
    .replace(/EvalError: /gi, '')
    .replace(/InternalError: /gi, '')
    .replace(/AggregateError: /gi, '')
    .replace(/auth\/[a-z-]+/gi, 'authentication error')
    .replace(/firestore\/[a-z-]+/gi, 'database error')
    .replace(/firebase\/[a-z-]+/gi, 'service error')
    .replace(/stripe\/[a-z-]+/gi, 'payment error')
    .replace(/paypal\/[a-z-]+/gi, 'payment error')
    .replace(/mailjet\/[a-z-]+/gi, 'email error')
    .replace(/\b\d{3}\b/g, '') // Remove HTTP status codes
    .replace(/at [a-zA-Z_][a-zA-Z0-9_]* \(.*?\)/g, '') // Remove stack trace lines
    .replace(/at [a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]* \(.*?\)/g, '') // Remove more stack traces
    .replace(/:\d+:\d+/g, '') // Remove line/column numbers
    .replace(/https?:\/\/[^\s]+/gi, '') // Remove URLs
    .replace(/\/[a-zA-Z0-9_/-]+\.js/g, '') // Remove JS file paths
    .trim();

  // If sanitization removed everything, return generic message
  if (!sanitized || sanitized.length < 10) {
    return 'Something went wrong. Please try again.';
  }

  return sanitized;
}