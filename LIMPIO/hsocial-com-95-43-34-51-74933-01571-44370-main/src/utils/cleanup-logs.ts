// Professional logging system for production
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private isDevelopment = import.meta.env.MODE === 'development';
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createEntry(level: LogLevel, module: string, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(module: string, message: string, data?: any) {
    const entry = this.createEntry('debug', module, message, data);
    this.addLog(entry);
    
    if (this.isDevelopment) {
      console.log(`🐛 [${module}] ${message}`, data || '');
    }
  }

  info(module: string, message: string, data?: any) {
    const entry = this.createEntry('info', module, message, data);
    this.addLog(entry);
    
    if (this.isDevelopment) {
      console.info(`ℹ️ [${module}] ${message}`, data || '');
    }
  }

  warn(module: string, message: string, data?: any) {
    const entry = this.createEntry('warn', module, message, data);
    this.addLog(entry);
    
    if (this.isDevelopment) {
      console.warn(`⚠️ [${module}] ${message}`, data || '');
    }
    
    // En producción, enviar warnings a un servicio de monitoreo
    if (!this.isDevelopment) {
      this.sendToMonitoring('warn', entry);
    }
  }

  error(module: string, message: string, error?: any) {
    const entry = this.createEntry('error', module, message, error);
    this.addLog(entry);
    
    if (this.isDevelopment) {
      console.error(`❌ [${module}] ${message}`, error || '');
    }
    
    // En producción, siempre enviar errores a monitoreo
    if (!this.isDevelopment) {
      this.sendToMonitoring('error', entry);
    }
  }

  private sendToMonitoring(level: LogLevel, entry: LogEntry) {
    // En producción, aquí se enviarían los logs a un servicio como Sentry, LogRocket, etc.
    // Para ahora, guardamos en localStorage para debugging
    try {
      const existingLogs = JSON.parse(localStorage.getItem('production-logs') || '[]');
      existingLogs.push(entry);
      localStorage.setItem('production-logs', JSON.stringify(existingLogs.slice(-100)));
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('production-logs');
  }
}

// Global logger instance
export const logger = Logger.getInstance();

// Convenience functions for backward compatibility
export const log = logger.debug.bind(logger, 'App');
export const warn = logger.warn.bind(logger, 'App');
export const error = logger.error.bind(logger, 'App');

// Module-specific logger creator
export const createLogger = (module: string) => ({
  debug: (message: string, data?: any) => logger.debug(module, message, data),
  info: (message: string, data?: any) => logger.info(module, message, data),
  warn: (message: string, data?: any) => logger.warn(module, message, data),
  error: (message: string, error?: any) => logger.error(module, message, error),
});

// Development only - expose logger globally for debugging
if (import.meta.env.MODE === 'development') {
  (window as any).__logger = logger;
}