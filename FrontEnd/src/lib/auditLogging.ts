
export enum AuditEventType {
  USER_ACTION = 'user_action',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  SYSTEM_EVENT = 'system_event',
  SECURITY_EVENT = 'security_event',
  COMPLIANCE_EVENT = 'compliance_event'
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  action: string;
  severity: AuditSeverity;
  timestamp: string;
  userId?: string;
  sessionId: string;
  ipAddress?: string;
  userAgent: string;
  resource?: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  metadata: Record<string, any>;
  success: boolean;
  errorMessage?: string;
  complianceFlags?: string[];
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  eventTypes: AuditEventType[];
  condition: (event: AuditEvent) => boolean;
  severity: AuditSeverity;
  retentionDays: number;
}

class AuditLogger {
  private eventQueue: AuditEvent[] = [];
  private complianceRules: ComplianceRule[] = [];
  private isOnline = navigator.onLine;
  private maxQueueSize = 500;
  private flushInterval = 10000; // 10 seconds for audit logs
  private debugMode = process.env.NODE_ENV === 'development';

  constructor() {
    this.initializeComplianceRules();
    this.startPeriodicFlush();
    
    // Listen for online/offline events
    window.addEventListener('online', this.flushEvents.bind(this));
    window.addEventListener('offline', () => { this.isOnline = false; });
    
    // Flush events before page unload (critical for audit logs)
    window.addEventListener('beforeunload', this.flushEvents.bind(this));
  }

  private initializeComplianceRules(): void {
    this.complianceRules = [
      {
        id: 'gdpr_data_access',
        name: 'GDPR Data Access',
        description: 'Track personal data access for GDPR compliance',
        eventTypes: [AuditEventType.DATA_ACCESS],
        condition: (event) => event.metadata.containsPII === true,
        severity: AuditSeverity.INFO,
        retentionDays: 2555 // 7 years
      },
      {
        id: 'data_modification_sensitive',
        name: 'Sensitive Data Modification',
        description: 'Track modifications to sensitive data',
        eventTypes: [AuditEventType.DATA_MODIFICATION],
        condition: (event) => event.metadata.sensitive === true,
        severity: AuditSeverity.WARNING,
        retentionDays: 2555
      },
      {
        id: 'failed_authentication',
        name: 'Failed Authentication Attempts',
        description: 'Track failed login attempts for security',
        eventTypes: [AuditEventType.AUTHENTICATION],
        condition: (event) => !event.success,
        severity: AuditSeverity.ERROR,
        retentionDays: 365
      },
      {
        id: 'admin_actions',
        name: 'Administrative Actions',
        description: 'Track all administrative actions',
        eventTypes: [AuditEventType.USER_ACTION],
        condition: (event) => event.metadata.isAdminAction === true,
        severity: AuditSeverity.WARNING,
        retentionDays: 2555
      },
      {
        id: 'security_violations',
        name: 'Security Violations',
        description: 'Track security-related violations',
        eventTypes: [AuditEventType.SECURITY_EVENT],
        condition: () => true,
        severity: AuditSeverity.CRITICAL,
        retentionDays: 2555
      }
    ];
  }

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionId(): string {
    return sessionStorage.getItem('auditSessionId') || 'unknown_session';
  }

  private getUserId(): string | undefined {
    return localStorage.getItem('userId') || undefined;
  }

  private async getClientIP(): Promise<string | undefined> {
    try {
      // In a real app, you might have an endpoint to get client IP
      // For now, we'll return undefined
      return undefined;
    } catch {
      return undefined;
    }
  }

  public async log(
    type: AuditEventType,
    action: string,
    options: {
      severity?: AuditSeverity;
      resource?: string;
      resourceId?: string;
      oldValue?: any;
      newValue?: any;
      metadata?: Record<string, any>;
      success?: boolean;
      errorMessage?: string;
    } = {}
  ): Promise<void> {
    const {
      severity = AuditSeverity.INFO,
      resource,
      resourceId,
      oldValue,
      newValue,
      metadata = {},
      success = true,
      errorMessage
    } = options;

    const event: AuditEvent = {
      id: this.generateEventId(),
      type,
      action,
      severity,
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      resource,
      resourceId,
      oldValue,
      newValue,
      metadata: {
        ...metadata,
        url: window.location.href,
        referrer: document.referrer
      },
      success,
      errorMessage,
      complianceFlags: this.checkComplianceRules(type, metadata)
    };

    this.eventQueue.push(event);

    if (this.debugMode) {
      console.log('[AuditLogger] Event logged:', event);
    }

    // Store in localStorage for persistence (encrypted in production)
    this.persistEventQueue();

    // Flush immediately for critical events
    if (severity === AuditSeverity.CRITICAL) {
      await this.flushEvents();
    }

    // Flush if queue is getting full
    if (this.eventQueue.length >= this.maxQueueSize) {
      await this.flushEvents();
    }
  }

  private checkComplianceRules(eventType: AuditEventType, metadata: Record<string, any>): string[] {
    const flags: string[] = [];
    
    this.complianceRules.forEach(rule => {
      if (rule.eventTypes.includes(eventType)) {
        const event = { type: eventType, metadata } as AuditEvent;
        if (rule.condition(event)) {
          flags.push(rule.id);
        }
      }
    });

    return flags;
  }

  private persistEventQueue(): void {
    try {
      const stored = JSON.parse(localStorage.getItem('auditEventQueue') || '[]');
      const combined = [...stored, ...this.eventQueue].slice(-this.maxQueueSize);
      localStorage.setItem('auditEventQueue', JSON.stringify(combined));
    } catch (error) {
      console.error('[AuditLogger] Failed to persist event queue:', error);
    }
  }

  private loadPersistedEvents(): void {
    try {
      const stored = JSON.parse(localStorage.getItem('auditEventQueue') || '[]');
      this.eventQueue = [...this.eventQueue, ...stored];
      localStorage.removeItem('auditEventQueue');
    } catch (error) {
      console.error('[AuditLogger] Failed to load persisted events:', error);
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
      await this.sendEventsToAuditServer(eventsToSend);
      
      if (this.debugMode) {
        console.log(`[AuditLogger] Sent ${eventsToSend.length} audit events to server`);
      }
    } catch (error) {
      console.error('[AuditLogger] Failed to send audit events:', error);
      
      // Re-queue events for retry (audit logs are critical)
      this.eventQueue = [...eventsToSend, ...this.eventQueue];
      this.persistEventQueue();
    }
  }

  private async sendEventsToAuditServer(events: AuditEvent[]): Promise<void> {
    // In a real app, this would send to your secure audit logging service
    // This should be a separate, highly secure endpoint
    const payload = {
      events,
      timestamp: new Date().toISOString(),
      checksum: this.calculateChecksum(events) // Integrity check
    };

    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.01) { // 99% success rate for audit logs
          resolve(undefined);
        } else {
          reject(new Error('Audit server error'));
        }
      }, 100);
    });
  }

  private calculateChecksum(events: AuditEvent[]): string {
    // Simple checksum calculation for demonstration
    const data = JSON.stringify(events);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  // Specific audit logging methods
  public async logUserAction(
    action: string,
    resource?: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log(AuditEventType.USER_ACTION, action, {
      resource,
      resourceId,
      metadata
    });
  }

  public async logDataAccess(
    resource: string,
    resourceId: string,
    containsPII: boolean = false,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log(AuditEventType.DATA_ACCESS, 'data_accessed', {
      resource,
      resourceId,
      metadata: {
        ...metadata,
        containsPII
      }
    });
  }

  public async logDataModification(
    resource: string,
    resourceId: string,
    oldValue: any,
    newValue: any,
    sensitive: boolean = false,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log(AuditEventType.DATA_MODIFICATION, 'data_modified', {
      resource,
      resourceId,
      oldValue,
      newValue,
      severity: sensitive ? AuditSeverity.WARNING : AuditSeverity.INFO,
      metadata: {
        ...metadata,
        sensitive
      }
    });
  }

  public async logAuthentication(
    action: string,
    success: boolean,
    errorMessage?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log(AuditEventType.AUTHENTICATION, action, {
      success,
      errorMessage,
      severity: success ? AuditSeverity.INFO : AuditSeverity.ERROR,
      metadata
    });
  }

  public async logSecurityEvent(
    action: string,
    severity: AuditSeverity = AuditSeverity.WARNING,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log(AuditEventType.SECURITY_EVENT, action, {
      severity,
      metadata
    });
  }

  public async logComplianceEvent(
    action: string,
    complianceType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log(AuditEventType.COMPLIANCE_EVENT, action, {
      severity: AuditSeverity.WARNING,
      metadata: {
        ...metadata,
        complianceType
      }
    });
  }

  // Get audit summary for compliance reporting
  public getAuditSummary(): {
    queuedEvents: number;
    complianceRules: ComplianceRule[];
    lastFlush: string;
  } {
    return {
      queuedEvents: this.eventQueue.length,
      complianceRules: this.complianceRules,
      lastFlush: new Date().toISOString()
    };
  }

  // Generate compliance report
  public generateComplianceReport(startDate: Date, endDate: Date): {
    totalEvents: number;
    eventsByType: Record<AuditEventType, number>;
    complianceFlags: Record<string, number>;
    securityEvents: number;
  } {
    // This would typically query the audit server
    // For now, return a mock report
    return {
      totalEvents: this.eventQueue.length,
      eventsByType: {
        [AuditEventType.USER_ACTION]: 0,
        [AuditEventType.DATA_ACCESS]: 0,
        [AuditEventType.DATA_MODIFICATION]: 0,
        [AuditEventType.AUTHENTICATION]: 0,
        [AuditEventType.AUTHORIZATION]: 0,
        [AuditEventType.SYSTEM_EVENT]: 0,
        [AuditEventType.SECURITY_EVENT]: 0,
        [AuditEventType.COMPLIANCE_EVENT]: 0
      },
      complianceFlags: {},
      securityEvents: 0
    };
  }
}

// Singleton instance
export const auditLogger = new AuditLogger();
