// src/utils/logger.ts

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  action: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  message?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}
class Logger {
  private serviceName: string;
  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }
  private log(
    level: LogLevel,
    action: string,
    userId?: string,
    metadata?: Record<string, unknown>,
    message?: string,
    error?: Error,
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      action,
      userId,
      metadata,
      message,
    };
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    // In a real application, this would send to a logging service (e.g., Splunk, Datadog, CloudWatch)
    // For now, we'll log to console.
    console.log(JSON.stringify(entry));
  }
  debug(
    action: string,
    userId?: string,
    metadata?: Record<string, unknown>,
    message?: string,
  ) {
    this.log(LogLevel.DEBUG, action, userId, metadata, message);
  }
  info(
    action: string,
    userId?: string,
    metadata?: Record<string, unknown>,
    message?: string,
  ) {
    this.log(LogLevel.INFO, action, userId, metadata, message);
  }
  warn(
    action: string,
    userId?: string,
    metadata?: Record<string, unknown>,
    message?: string,
  ) {
    this.log(LogLevel.WARN, action, userId, metadata, message);
  }
  error(
    action: string,
    userId?: string,
    metadata?: Record<string, unknown>,
    error?: Error,
    message?: string,
  ) {
    this.log(LogLevel.ERROR, action, userId, metadata, message, error);
  }
}
export default Logger;
