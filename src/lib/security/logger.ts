// Centralized logging system - logs internally without exposing details to users

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

interface LogContext {
  userId?: string;
  endpoint?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

class Logger {
  private sanitize(data: any): any {
    if (!data) return data;
    
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'privateKey', 'authorization'];
    
    if (typeof data === 'object') {
      const sanitized = Array.isArray(data) ? [...data] : { ...data };
      
      for (const key in sanitized) {
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitize(sanitized[key]);
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: any) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = this.sanitize(context);
    const sanitizedError = error ? this.sanitize({
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }) : undefined;

    const logEntry = {
      timestamp,
      level,
      message,
      context: sanitizedContext,
      error: sanitizedError,
    };

    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logEntry));
    } else {
      console.log(`[${level}] ${timestamp} - ${message}`, sanitizedContext || '', sanitizedError || '');
    }
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: LogContext, error?: any) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, context);
    }
  }
}

export const logger = new Logger();
