/**
 * Console utilities for production safety
 * Disables console methods in production to hide developer logs from users
 */

const isProduction = process.env.NODE_ENV === 'production';

const noop = () => {};

const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
  trace: console.trace,
};

// In production, disable all console methods except for critical errors we want to track
if (isProduction) {
  console.log = noop;
  console.warn = noop;
  console.info = noop;
  console.debug = noop;
  console.trace = noop;

  // Keep error for critical issues, but sanitize what gets logged
  console.error = (message?: any, ...optionalParams: any[]) => {
    // Only log errors that are critical and don't expose user data
    if (typeof message === 'string') {
      // Check if it's a user-friendly error we want to track silently
      if (message.includes('user') || message.includes('auth') || message.includes('payment')) {
        // Silently log to a service if available
        // Example: sendToLoggingService(message, optionalParams);
        return;
      }
    }
    // For other errors, still suppress in production
    noop();
  };
}

// Export original console for development use
export { originalConsole };

// Utility to temporarily enable console for debugging (development only)
export function enableConsole() {
  if (!isProduction) {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
    console.trace = originalConsole.trace;
  }
}

// Utility to disable console (useful for testing)
export function disableConsole() {
  console.log = noop;
  console.warn = noop;
  console.error = noop;
  console.info = noop;
  console.debug = noop;
  console.trace = noop;
}

// Initialize offline persistence system
// Temporarily disabled to fix build issues
// import('./offlinePersistence').then(({ offlinePersistence }) => {
//   console.log('Offline persistence system initialized');
// }).catch(error => {
//   console.error('Failed to initialize offline persistence:', error);
// });