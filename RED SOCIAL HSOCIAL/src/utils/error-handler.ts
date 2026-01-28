// Global error handling utilities for production
import React from 'react';
import { createLogger } from './cleanup-logs';

const errorLogger = createLogger('ErrorHandler');

export interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  constructor() {
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        message: 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    });
  }

  handleError(error: Error | unknown, errorInfo?: Partial<ErrorInfo>) {
    const info: ErrorInfo = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...errorInfo,
    };

    // Log error
    errorLogger.error('Global error caught', info);

    // In production, send to monitoring service
    if (import.meta.env.MODE === 'production') {
      this.sendToMonitoring(info);
    }

    return info;
  }

  private sendToMonitoring(errorInfo: ErrorInfo) {
    // Here you would send to your monitoring service (Sentry, LogRocket, etc.)
    // For now, we'll store in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('production-errors') || '[]');
      errors.push(errorInfo);
      localStorage.setItem('production-errors', JSON.stringify(errors.slice(-50)));
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }

  // Helper function for async operations
  async handleAsyncError<T>(
    operation: () => Promise<T>,
    context: string,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error, { message: `Error in ${context}` });
      return fallback;
    }
  }

  // Helper function to wrap components with error boundaries
  wrapWithErrorBoundary<T>(component: T, componentName: string): T {
    // This would be used with React Error Boundaries
    return component;
  }
}

export const errorHandler = ErrorHandler.getInstance();

// Helper function for API calls
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T | undefined> {
  return errorHandler.handleAsyncError(apiCall, context, fallback);
}

// React Error Boundary HOC
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<any>
) {
  return function WrappedComponent(props: P) {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      errorHandler.handleError(error, { 
        message: `Error in component ${Component.name || 'Unknown'}` 
      });
      
      if (fallback) {
        const FallbackComponent = fallback;
        return React.createElement(FallbackComponent);
      }
      
      return React.createElement('div', {}, 'Something went wrong. Please refresh the page.');
    }
  };
}