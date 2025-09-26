type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private isDev = import.meta.env.DEV;
  private isConsoleEnabled = 
    import.meta.env.VITE_FORCE_LOGS === 'true' || 
    this.isDev;

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data
    };
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.isConsoleEnabled) return;

    const logEntry = this.formatMessage(level, message, data);
    const prefix = `[${logEntry.timestamp}] [${level.toUpperCase()}] 🎯 HeyTrack:`;

    switch (level) {
      case 'debug':
        console.debug(prefix, message, data || '');
        break;
      case 'info':
        console.info(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'error':
        console.error(prefix, message, data || '');
        break;
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  // API specific logging methods
  apiCall(method: string, endpoint: string, data?: any) {
    this.info(`API Call: ${method} ${endpoint}`, data);
  }

  apiSuccess(method: string, endpoint: string, response?: any) {
    this.info(`API Success: ${method} ${endpoint}`, response);
  }

  apiError(method: string, endpoint: string, error: any) {
    this.error(`API Error: ${method} ${endpoint}`, error);
  }

  // Database specific logging
  dbQuery(table: string, operation: string, params?: any) {
    this.debug(`DB Query: ${operation} on ${table}`, params);
  }

  dbSuccess(table: string, operation: string, result?: any) {
    this.info(`DB Success: ${operation} on ${table}`, result);
  }

  dbError(table: string, operation: string, error: any) {
    this.error(`DB Error: ${operation} on ${table}`, error);
  }
}

export const logger = new Logger();