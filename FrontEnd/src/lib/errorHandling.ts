import { toast } from '@/hooks/use-toast';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  BUSINESS_LOGIC = 'business_logic',
  UI = 'ui',
  PERFORMANCE = 'performance',
  EXTERNAL_SERVICE = 'external_service'
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

export interface AppError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: ErrorContext;
  originalError?: Error;
  retry?: boolean;
  retryCount?: number;
}

class ErrorHandler {
  private errorQueue: AppError[] = [];
  private isOnline = navigator.onLine;
  private maxRetries = 3;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.processErrorQueue.bind(this));
    window.addEventListener('offline', () => { this.isOnline = false; });
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createContext(additionalContext?: Partial<ErrorContext>): ErrorContext {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
      ...additionalContext
    };
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private getUserId(): string | undefined {
    // Get from your auth system
    return localStorage.getItem('userId') || undefined;
  }

  public captureError(
    error: Error | string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Partial<ErrorContext>
  ): AppError {
    const appError: AppError = {
      id: this.generateErrorId(),
      message: typeof error === 'string' ? error : error.message,
      category,
      severity,
      context: this.createContext(context),
      originalError: typeof error === 'string' ? undefined : error,
      retry: this.shouldRetry(category),
      retryCount: 0
    };

    // Add stack trace if available
    if (typeof error !== 'string' && error.stack) {
      appError.context.stackTrace = error.stack;
    }

    console.error(`[ErrorHandler] ${severity.toUpperCase()} - ${category}:`, appError);

    // Handle based on severity
    this.handleErrorBySeverity(appError);

    // Queue for persistence
    this.queueError(appError);

    return appError;
  }

  private shouldRetry(category: ErrorCategory): boolean {
    return [
      ErrorCategory.NETWORK,
      ErrorCategory.EXTERNAL_SERVICE
    ].includes(category);
  }

  private handleErrorBySeverity(error: AppError): void {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        this.showCriticalErrorDialog(error);
        break;
      case ErrorSeverity.HIGH:
        toast({
          title: "Error Occurred",
          description: error.message,
          variant: "destructive",
        });
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('[ErrorHandler] Medium severity error:', error);
        break;
      case ErrorSeverity.LOW:
        console.info('[ErrorHandler] Low severity error:', error);
        break;
    }
  }

  private showCriticalErrorDialog(error: AppError): void {
    toast({
      title: "Critical Error",
      description: `${error.message} - Error ID: ${error.id}`,
      variant: "destructive",
    });
  }

  private queueError(error: AppError): void {
    this.errorQueue.push(error);

    // Store in localStorage for persistence
    const storedErrors = JSON.parse(localStorage.getItem('errorQueue') || '[]');
    storedErrors.push(error);
    
    // Keep only last 100 errors
    const trimmedErrors = storedErrors.slice(-100);
    localStorage.setItem('errorQueue', JSON.stringify(trimmedErrors));

    // Try to process immediately if online
    if (this.isOnline) {
      this.processErrorQueue();
    }
  }

  private async processErrorQueue(): Promise<void> {
    this.isOnline = navigator.onLine;
    
    if (!this.isOnline || this.errorQueue.length === 0) {
      return;
    }

    const errorsToProcess = [...this.errorQueue];
    this.errorQueue = [];

    for (const error of errorsToProcess) {
      try {
        await this.sendErrorToServer(error);
        console.log(`[ErrorHandler] Error ${error.id} sent to server`);
      } catch (sendError) {
        console.error(`[ErrorHandler] Failed to send error ${error.id}:`, sendError);
        
        // Retry logic
        if (error.retry && (error.retryCount || 0) < this.maxRetries) {
          error.retryCount = (error.retryCount || 0) + 1;
          setTimeout(() => this.queueError(error), 5000 * error.retryCount);
        }
      }
    }

    // Clear processed errors from localStorage
    localStorage.removeItem('errorQueue');
  }

  private async sendErrorToServer(error: AppError): Promise<void> {
    // In a real app, this would send to your error tracking service
    // For now, we'll simulate the API call
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve(undefined);
        } else {
          reject(new Error('Server error'));
        }
      }, 100);
    });
  }

  public getErrorHistory(): AppError[] {
    return JSON.parse(localStorage.getItem('errorQueue') || '[]');
  }

  public clearErrorHistory(): void {
    localStorage.removeItem('errorQueue');
    this.errorQueue = [];
  }

  // Utility methods for common error scenarios
  public captureNetworkError(error: Error, endpoint?: string): AppError {
    return this.captureError(error, ErrorCategory.NETWORK, ErrorSeverity.HIGH, {
      action: 'network_request',
      metadata: { endpoint }
    });
  }

  public captureValidationError(message: string, field?: string): AppError {
    return this.captureError(message, ErrorCategory.VALIDATION, ErrorSeverity.MEDIUM, {
      action: 'validation',
      metadata: { field }
    });
  }

  public captureUIError(error: Error, component: string): AppError {
    return this.captureError(error, ErrorCategory.UI, ErrorSeverity.MEDIUM, {
      component,
      action: 'ui_interaction'
    });
  }

  public captureBusinessLogicError(message: string, context?: Record<string, any>): AppError {
    return this.captureError(message, ErrorCategory.BUSINESS_LOGIC, ErrorSeverity.HIGH, {
      action: 'business_logic',
      metadata: context
    });
  }
}

// Singleton instance
export const errorHandler = new ErrorHandler();

// React Error Boundary integration
export const handleReactError = (error: Error, errorInfo: React.ErrorInfo): void => {
  errorHandler.captureError(error, ErrorCategory.UI, ErrorSeverity.HIGH, {
    component: 'React Component',
    metadata: { componentStack: errorInfo.componentStack }
  });
};

// Global error handlers
window.addEventListener('error', (event) => {
  errorHandler.captureError(
    event.error || new Error(event.message),
    ErrorCategory.UI,
    ErrorSeverity.HIGH,
    {
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    }
  );
});

window.addEventListener('unhandledrejection', (event) => {
  errorHandler.captureError(
    new Error(String(event.reason)),
    ErrorCategory.BUSINESS_LOGIC,
    ErrorSeverity.HIGH,
    {
      action: 'unhandled_promise_rejection'
    }
  );
});
