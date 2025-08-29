
export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  USER_ACTION = 'user_action',
  FEATURE_USAGE = 'feature_usage',
  PERFORMANCE = 'performance',
  ERROR = 'error',
  CONVERSION = 'conversion'
}

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  name: string;
  properties: Record<string, any>;
  timestamp: string;
  sessionId: string;
  userId?: string;
  anonymousId: string;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
  planType?: string;
  createdAt?: string;
  lastSeen?: string;
  [key: string]: any;
}

export interface SessionInfo {
  sessionId: string;
  startTime: string;
  userAgent: string;
  screen: string;
  timezone: string;
  referrer: string;
  url: string;
}

class AnalyticsManager {
  private eventQueue: AnalyticsEvent[] = [];
  private sessionInfo: SessionInfo;
  private userProperties: UserProperties = {};
  private isOnline = navigator.onLine;
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private debugMode = process.env.NODE_ENV === 'development';

  constructor() {
    this.sessionInfo = this.initializeSession();
    this.startPeriodicFlush();
    
    // Listen for online/offline events
    window.addEventListener('online', this.flushEvents.bind(this));
    window.addEventListener('offline', () => { this.isOnline = false; });
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Flush events before page unload
    window.addEventListener('beforeunload', this.flushEvents.bind(this));
  }

  private initializeSession(): SessionInfo {
    const sessionId = this.getOrCreateSessionId();
    
    return {
      sessionId,
      startTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer,
      url: window.location.href
    };
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analyticsSessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analyticsSessionId', sessionId);
    }
    return sessionId;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getAnonymousId(): string {
    let anonymousId = localStorage.getItem('analyticsAnonymousId');
    if (!anonymousId) {
      anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analyticsAnonymousId', anonymousId);
    }
    return anonymousId;
  }

  public identify(userId: string, properties?: UserProperties): void {
    this.userProperties = {
      ...this.userProperties,
      userId,
      ...properties,
      lastSeen: new Date().toISOString()
    };

    this.track('user_identified', {
      userId,
      ...properties
    });

    if (this.debugMode) {
      console.log('[Analytics] User identified:', this.userProperties);
    }
  }

  public track(
    eventName: string,
    properties: Record<string, any> = {},
    eventType: AnalyticsEventType = AnalyticsEventType.USER_ACTION
  ): void {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type: eventType,
      name: eventName,
      properties: {
        ...properties,
        url: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionInfo.sessionId,
      userId: this.userProperties.userId,
      anonymousId: this.getAnonymousId()
    };

    this.eventQueue.push(event);

    if (this.debugMode) {
      console.log('[Analytics] Event tracked:', event);
    }

    // Store in localStorage for persistence
    this.persistEventQueue();

    // Flush if batch size reached
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  public page(path?: string, properties: Record<string, any> = {}): void {
    this.track('page_viewed', {
      path: path || window.location.pathname,
      title: document.title,
      ...properties
    }, AnalyticsEventType.PAGE_VIEW);
  }

  public feature(featureName: string, properties: Record<string, any> = {}): void {
    this.track(`feature_${featureName}`, properties, AnalyticsEventType.FEATURE_USAGE);
  }

  public performance(metricName: string, value: number, properties: Record<string, any> = {}): void {
    this.track(`performance_${metricName}`, {
      value,
      ...properties
    }, AnalyticsEventType.PERFORMANCE);
  }

  public conversion(eventName: string, value?: number, properties: Record<string, any> = {}): void {
    this.track(eventName, {
      value,
      ...properties
    }, AnalyticsEventType.CONVERSION);
  }

  private persistEventQueue(): void {
    try {
      const stored = JSON.parse(localStorage.getItem('analyticsEventQueue') || '[]');
      const combined = [...stored, ...this.eventQueue].slice(-200); // Keep last 200 events
      localStorage.setItem('analyticsEventQueue', JSON.stringify(combined));
    } catch (error) {
      console.error('[Analytics] Failed to persist event queue:', error);
    }
  }

  private loadPersistedEvents(): void {
    try {
      const stored = JSON.parse(localStorage.getItem('analyticsEventQueue') || '[]');
      this.eventQueue = [...this.eventQueue, ...stored];
      localStorage.removeItem('analyticsEventQueue');
    } catch (error) {
      console.error('[Analytics] Failed to load persisted events:', error);
    }
  }

  private async flushEvents(): Promise<void> {
    this.isOnline = navigator.onLine;
    
    if (!this.isOnline || this.eventQueue.length === 0) {
      return;
    }

    // Load any persisted events
    this.loadPersistedEvents();

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.sendEventsToServer(eventsToSend);
      
      if (this.debugMode) {
        console.log(`[Analytics] Sent ${eventsToSend.length} events to server`);
      }
    } catch (error) {
      console.error('[Analytics] Failed to send events:', error);
      
      // Re-queue events for retry
      this.eventQueue = [...eventsToSend, ...this.eventQueue];
      this.persistEventQueue();
    }
  }

  private async sendEventsToServer(events: AnalyticsEvent[]): Promise<void> {
    // In a real app, this would send to your analytics service
    // For now, we'll simulate the API call
    const payload = {
      events,
      session: this.sessionInfo,
      user: this.userProperties,
      timestamp: new Date().toISOString()
    };

    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.05) { // 95% success rate
          resolve(undefined);
        } else {
          reject(new Error('Analytics server error'));
        }
      }, 200);
    });
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  private handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      this.flushEvents();
    }
  }

  // Utility methods for common tracking scenarios
  public trackButtonClick(buttonName: string, context?: Record<string, any>): void {
    this.track('button_clicked', {
      buttonName,
      ...context
    });
  }

  public trackFormSubmit(formName: string, success: boolean, context?: Record<string, any>): void {
    this.track('form_submitted', {
      formName,
      success,
      ...context
    });
  }

  public trackSearchQuery(query: string, resultsCount?: number): void {
    this.track('search_performed', {
      query,
      resultsCount
    });
  }

  public trackError(errorId: string, errorType: string, context?: Record<string, any>): void {
    this.track('error_occurred', {
      errorId,
      errorType,
      ...context
    }, AnalyticsEventType.ERROR);
  }

  public trackTimeSpent(component: string, duration: number): void {
    this.performance('time_spent', duration, { component });
  }

  // Get analytics summary
  public getAnalyticsSummary(): {
    sessionInfo: SessionInfo;
    userProperties: UserProperties;
    queuedEvents: number;
  } {
    return {
      sessionInfo: this.sessionInfo,
      userProperties: this.userProperties,
      queuedEvents: this.eventQueue.length
    };
  }
}

// Singleton instance
export const analytics = new AnalyticsManager();

// Auto-track page views for SPA navigation
let currentPath = window.location.pathname;
const observer = new MutationObserver(() => {
  if (window.location.pathname !== currentPath) {
    currentPath = window.location.pathname;
    analytics.page();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
