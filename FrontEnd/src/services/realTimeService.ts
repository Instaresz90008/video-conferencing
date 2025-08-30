// // realTimeService.ts - Fixed version with Redux integration

// import { store } from '@/store/index'; // Import your Redux store
// import { handleParticipantUpdate, handleMeetingEvent } from '@/store/meetingSlice';

// interface RealTimeMessage {
//   type: string;
//   meetingId?: string;
//   participantId?: string;
//   signal?: any;
//   data?: any;
//   channel?: string;
// }

// interface SubscriptionCallback {
//   (data: any): void;
// }

// class RealTimeService {
//   private socket: WebSocket | null = null;
//   private subscriptions = new Map<string, Set<SubscriptionCallback>>();
//   private isConnected = false;
//   private connectionPromise: Promise<boolean> | null = null;
//   private reconnectAttempts = 0;
//   private maxReconnectAttempts = 5;
//   private reconnectDelay = 1000;
//   private messageQueue: RealTimeMessage[] = [];
//   private heartbeatInterval: NodeJS.Timeout | null = null;

//   async connect(): Promise<boolean> {
//     // Return existing connection promise if already connecting
//     if (this.connectionPromise) {
//       return this.connectionPromise;
//     }

//     // Return true if already connected
//     if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
//       return true;
//     }

//     this.connectionPromise = this.performConnection();
//     return this.connectionPromise;
//   }

//   private async performConnection(): Promise<boolean> {
//     try {
//       const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4000/ws';
      
//       console.log(`Attempting to connect to WebSocket server at: ${wsUrl}`);
      
//       this.socket = new WebSocket(wsUrl);

//       return new Promise((resolve) => {
//         if (!this.socket) {
//           resolve(false);
//           return;
//         }

//         // Connection timeout
//         const timeout = setTimeout(() => {
//           console.error('WebSocket connection timeout');
//           this.socket?.close();
//           resolve(false);
//         }, 10000);

//         // Connection successful
//         this.socket.onopen = () => {
//           clearTimeout(timeout);
//           console.log('WebSocket connected successfully');
//           this.isConnected = true;
//           this.reconnectAttempts = 0;
//           this.connectionPromise = null;
//           this.setupEventHandlers();
//           this.startHeartbeat();
//           this.processMessageQueue();
//           this.authenticateConnection();
//           resolve(true);
//         };

//         // Connection failed
//         this.socket.onerror = (error) => {
//           clearTimeout(timeout);
//           console.error('WebSocket connection failed:', error);
//           this.isConnected = false;
//           this.connectionPromise = null;
//           this.scheduleReconnect();
//           resolve(false);
//         };

//         // Connection closed
//         this.socket.onclose = (event) => {
//           clearTimeout(timeout);
//           console.log('WebSocket connection closed:', event.code, event.reason);
//           this.isConnected = false;
//           this.connectionPromise = null;
//           this.stopHeartbeat();
          
//           if (event.code !== 1000) { // Not a normal closure
//             this.scheduleReconnect();
//           }
//           resolve(false);
//         };
//       });
//     } catch (error) {
//       console.error('Failed to create WebSocket connection:', error);
//       this.connectionPromise = null;
//       return false;
//     }
//   }

//   private setupEventHandlers() {
//     if (!this.socket) return;

//     this.socket.onmessage = (event) => {
//       try {
//         const message: RealTimeMessage = JSON.parse(event.data);
//         this.handleMessage(message);
//       } catch (error) {
//         console.error('Failed to parse WebSocket message:', error);
//       }
//     };
//   }

//   private handleMessage(message: RealTimeMessage) {
//     const { type, channel, data, error } = message;
    
//     console.log('📨 WebSocket message received:', message);
    
//     // Handle authentication response
//     if (type === 'auth_response') {
//       if (error) {
//         console.error('WebSocket authentication failed:', error);
//         this.disconnect();
//         return;
//       }
//       console.log('WebSocket authenticated successfully');
//       return;
//     }

//     // Handle subscription confirmations
//     if (type === 'subscription_confirmed') {
//       console.log(`Subscribed to channel: ${channel}`);
//       return;
//     }

//     // Handle pong responses
//     if (type === 'pong') {
//       return; // Heartbeat response
//     }

//     // CRITICAL FIX: Dispatch participant events to Redux store
//     if (type === 'participant_joined' || 
//         type === 'participant_left' || 
//         type === 'participant_updated') {
      
//       console.log('🔄 Dispatching participant update to Redux:', message);
//       store.dispatch(handleParticipantUpdate(message));
//     }
    
//     // Handle meeting events
//     if (type === 'meeting_ended' || 
//         type === 'participant_speaking' ||
//         type === 'screen_share_started' ||
//         type === 'screen_share_stopped') {
      
//       console.log('📢 Dispatching meeting event to Redux:', message);
//       store.dispatch(handleMeetingEvent(message));
//     }

//     // Handle regular channel subscriptions (for backward compatibility)
//     if (channel) {
//       const subscribers = this.subscriptions.get(channel);
//       if (subscribers) {
//         subscribers.forEach(callback => {
//           try {
//             callback(data || message);
//           } catch (error) {
//             console.error('Error in subscription callback:', error);
//           }
//         });
//       }
//     }
//   }

//   private authenticateConnection() {
//     // Send authentication message using cookies
//     this.send({
//       type: 'auth',
//       timestamp: Date.now()
//     });
//   }

//   private startHeartbeat() {
//     this.heartbeatInterval = setInterval(() => {
//       if (this.isConnected) {
//         this.send({ type: 'ping' });
//       }
//     }, 30000); // Send ping every 30 seconds
//   }

//   private stopHeartbeat() {
//     if (this.heartbeatInterval) {
//       clearInterval(this.heartbeatInterval);
//       this.heartbeatInterval = null;
//     }
//   }

//   subscribe(channel: string, callback: SubscriptionCallback): () => void {
//     if (!this.subscriptions.has(channel)) {
//       this.subscriptions.set(channel, new Set());
//     }
//     this.subscriptions.get(channel)!.add(callback);

//     // Subscribe to channel if connected
//     if (this.isConnected) {
//       this.send({
//         type: 'subscribe',
//         channel
//       });
//     }

//     // Return unsubscribe function
//     return () => this.unsubscribe(channel, callback);
//   }

//   unsubscribe(channel: string, callback?: SubscriptionCallback) {
//     if (callback) {
//       const subscribers = this.subscriptions.get(channel);
//       if (subscribers) {
//         subscribers.delete(callback);
        
//         // If no more subscribers for this channel, unsubscribe from server
//         if (subscribers.size === 0) {
//           this.subscriptions.delete(channel);
//           if (this.isConnected) {
//             this.send({
//               type: 'unsubscribe',
//               channel
//             });
//           }
//         }
//       }
//     } else {
//       this.subscriptions.delete(channel);
//       if (this.isConnected) {
//         this.send({
//           type: 'unsubscribe',
//           channel
//         });
//       }
//     }
//   }

//   send(message: RealTimeMessage): boolean {
//     if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
//       try {
//         this.socket.send(JSON.stringify(message));
//         return true;
//       } catch (error) {
//         console.error('Failed to send WebSocket message:', error);
//         return false;
//       }
//     }
    
//     // Queue message if not connected
//     this.messageQueue.push(message);
//     console.warn('Message queued - WebSocket not connected');
//     return false;
//   }

//   private processMessageQueue() {
//     while (this.messageQueue.length > 0 && this.isConnected) {
//       const message = this.messageQueue.shift();
//       if (message) {
//         this.send(message);
//       }
//     }
//   }

//   private scheduleReconnect() {
//     if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//       console.error('Max reconnection attempts reached');
//       return;
//     }

//     this.reconnectAttempts++;
    
//     // Exponential backoff with jitter
//     const delay = Math.min(
//       this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) + 
//       Math.random() * 1000,
//       30000
//     );

//     console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

//     setTimeout(() => {
//       if (!this.isConnected) {
//         console.log('Attempting to reconnect...');
//         this.connect().then(connected => {
//           if (connected) {
//             // Resubscribe to all channels
//             this.resubscribeToChannels();
//           }
//         });
//       }
//     }, delay);
//   }

//   private resubscribeToChannels() {
//     // Resubscribe to all active channels after reconnection
//     for (const channel of this.subscriptions.keys()) {
//       this.send({
//         type: 'subscribe',
//         channel
//       });
//     }
//   }

//   disconnect() {
//     this.stopHeartbeat();
//     if (this.socket) {
//       this.socket.close(1000, 'Client initiated disconnect');
//       this.socket = null;
//     }
//     this.isConnected = false;
//     this.subscriptions.clear();
//     this.reconnectAttempts = 0;
//     this.messageQueue = [];
//   }

//   // Utility methods
//   getIsConnected(): boolean {
//     return this.isConnected;
//   }

//   getConnectionStatus(): {
//     connected: boolean;
//     reconnectAttempts: number;
//     subscribedChannels: string[];
//     queuedMessages: number;
//   } {
//     return {
//       connected: this.isConnected,
//       reconnectAttempts: this.reconnectAttempts,
//       subscribedChannels: Array.from(this.subscriptions.keys()),
//       queuedMessages: this.messageQueue.length
//     };
//   }
// }

// export const realTimeService = new RealTimeService();
































interface RealTimeMessage {
  type: string;
  meetingId?: string;
  participantId?: string;
  signal?: any;
  data?: any;
  channel?: string;
}

interface SubscriptionCallback {
  (data: any): void;
}

class RealTimeService {
  private socket: WebSocket | null = null;
  private subscriptions = new Map<string, Set<SubscriptionCallback>>();
  private isConnected = false;
  private connectionPromise: Promise<boolean> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: RealTimeMessage[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;

  async connect(): Promise<boolean> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      return true;
    }

    this.connectionPromise = this.performConnection();
    return this.connectionPromise;
  }

  private async performConnection(): Promise<boolean> {
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4000/ws';
      
      console.log(`Connecting to WebSocket: ${wsUrl}`);
      
      this.socket = new WebSocket(wsUrl);

      return new Promise((resolve) => {
        if (!this.socket) {
          resolve(false);
          return;
        }

        const timeout = setTimeout(() => {
          console.error('WebSocket connection timeout');
          this.socket?.close();
          resolve(false);
        }, 10000);

        this.socket.onopen = () => {
          clearTimeout(timeout);
          console.log('✅ WebSocket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.connectionPromise = null;
          this.setupEventHandlers();
          this.startHeartbeat();
          this.processMessageQueue();
          this.authenticateConnection();
          resolve(true);
        };

        this.socket.onerror = (error) => {
          clearTimeout(timeout);
          console.error('❌ WebSocket connection failed:', error);
          this.isConnected = false;
          this.connectionPromise = null;
          this.scheduleReconnect();
          resolve(false);
        };

        this.socket.onclose = (event) => {
          clearTimeout(timeout);
          console.log('🔌 WebSocket connection closed:', event.code, event.reason);
          this.isConnected = false;
          this.connectionPromise = null;
          this.stopHeartbeat();
          
          if (event.code !== 1000) {
            this.scheduleReconnect();
          }
          resolve(false);
        };
      });
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.connectionPromise = null;
      return false;
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.onmessage = (event) => {
      try {
        const message: RealTimeMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  private handleMessage(message: RealTimeMessage) {
    const { type, channel, data } = message;
    
    console.log('📨 WebSocket message received:', message);
    
    if (type === 'auth_response') {
      if (message.error) {
        console.error('WebSocket authentication failed:', message.error);
        return;
      }
      console.log('✅ WebSocket authenticated successfully');
      return;
    }

    if (type === 'subscription_confirmed') {
      console.log(`✅ Subscribed to channel: ${channel}`);
      return;
    }

    if (type === 'pong') {
      return;
    }

    // Handle channel subscriptions
    if (channel) {
      const subscribers = this.subscriptions.get(channel);
      if (subscribers) {
        subscribers.forEach(callback => {
          try {
            callback(data || message);
          } catch (error) {
            console.error('Error in subscription callback:', error);
          }
        });
      }
    }
  }

  private authenticateConnection() {
    this.send({
      type: 'auth',
      userId: 'anonymous_user',
      timestamp: Date.now()
    });
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping' });
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  subscribe(channel: string, callback: SubscriptionCallback): () => void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)!.add(callback);

    if (this.isConnected) {
      this.send({
        type: 'subscribe',
        channel
      });
    }

    return () => this.unsubscribe(channel, callback);
  }

  unsubscribe(channel: string, callback?: SubscriptionCallback) {
    if (callback) {
      const subscribers = this.subscriptions.get(channel);
      if (subscribers) {
        subscribers.delete(callback);
        
        if (subscribers.size === 0) {
          this.subscriptions.delete(channel);
          if (this.isConnected) {
            this.send({
              type: 'unsubscribe',
              channel
            });
          }
        }
      }
    } else {
      this.subscriptions.delete(channel);
      if (this.isConnected) {
        this.send({
          type: 'unsubscribe',
          channel
        });
      }
    }
  }

  send(message: RealTimeMessage): boolean {
    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    }
    
    this.messageQueue.push(message);
    console.warn('Message queued - WebSocket not connected');
    return false;
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) + 
      Math.random() * 1000,
      30000
    );

    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (!this.isConnected) {
        console.log('Attempting to reconnect...');
        this.connect().then(connected => {
          if (connected) {
            this.resubscribeToChannels();
          }
        });
      }
    }, delay);
  }

  private resubscribeToChannels() {
    for (const channel of this.subscriptions.keys()) {
      this.send({
        type: 'subscribe',
        channel
      });
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close(1000, 'Client initiated disconnect');
      this.socket = null;
    }
    this.isConnected = false;
    this.subscriptions.clear();
    this.reconnectAttempts = 0;
    this.messageQueue = [];
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const realTimeService = new RealTimeService();