/**
 * Structured logging utility
 * Provides consistent logging interface with context support
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  env: string;
}

/**
 * Log a message with optional context
 */
export function log(level: LogLevel, message: string, context?: LogContext): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    env: process.env.NODE_ENV || 'development',
    ...(context && { context }),
  };

  // In production, log as JSON for parsing by log aggregators
  if (process.env.NODE_ENV === 'production') {
    const output = JSON.stringify(entry);

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'info':
      case 'debug':
      default:
        console.log(output);
        break;
    }
  } else {
    // In development, use readable format
    const contextStr = context ? ` ${JSON.stringify(context, null, 2)}` : '';
    const output = `[${level.toUpperCase()}] ${message}${contextStr}`;

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'info':
      case 'debug':
      default:
        console.log(output);
        break;
    }
  }
}

// Convenience methods
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};
