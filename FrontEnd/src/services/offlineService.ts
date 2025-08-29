
import { DATABASE_CONFIG } from '@/config/database';
import { realTimeService } from '@/services/realTimeService';

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineService {
  private isOnline = navigator.onLine;
  private offlineQueue: OfflineAction[] = [];
  private syncInProgress = false;

  constructor() {
    this.setupEventListeners();
    this.loadOfflineQueue();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private loadOfflineQueue() {
    const stored = localStorage.getItem('offline_queue');
    if (stored) {
      this.offlineQueue = JSON.parse(stored);
    }
  }

  private saveOfflineQueue() {
    localStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
  }

  addOfflineAction(type: string, data: any): void {
    if (this.isOnline) return;

    const action: OfflineAction = {
      id: `offline_${Date.now()}_${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.offlineQueue.push(action);
    this.saveOfflineQueue();
  }

  private async syncOfflineActions(): Promise<void> {
    if (this.syncInProgress || this.offlineQueue.length === 0) return;

    this.syncInProgress = true;
    console.log(`Syncing ${this.offlineQueue.length} offline actions...`);

    const actionsToSync = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const action of actionsToSync) {
      try {
        await this.executeAction(action);
        console.log(`Synced action: ${action.type}`);
      } catch (error) {
        console.error(`Failed to sync action ${action.type}:`, error);
        
        action.retryCount++;
        if (action.retryCount < 3) {
          this.offlineQueue.push(action);
        }
      }
    }

    this.saveOfflineQueue();
    this.syncInProgress = false;
  }

  private async executeAction(action: OfflineAction): Promise<void> {
    const baseUrl = `http://${DATABASE_CONFIG.host}:4000/api`;
    
    switch (action.type) {
      case 'send_message':
        await fetch(`${baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(action.data)
        });
        break;
        
      case 'join_meeting':
        await fetch(`${baseUrl}/meetings/${action.data.meetingId}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(action.data)
        });
        break;
        
      case 'update_profile':
        await fetch(`${baseUrl}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(action.data)
        });
        break;
        
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  getOfflineStatus(): { isOnline: boolean; queueLength: number } {
    return {
      isOnline: this.isOnline,
      queueLength: this.offlineQueue.length
    };
  }
}

export const offlineService = new OfflineService();
