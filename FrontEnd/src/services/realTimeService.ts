export interface RealTimeConnection {
  isConnected: boolean;
  socket: WebSocket | null;
  subscriptions: Map<string, Function[]>;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

class RealTimeService {
  private connection: RealTimeConnection = {
    isConnected: false,
    socket: null,
    subscriptions: new Map(),
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  };

  private readonly reconnectInterval = 3000; // 3 seconds
  private readonly maxReconnectInterval = 30000; // 30 seconds

  async connect(): Promise<boolean> {
    try {
      // Use environment variable for WebSocket URL
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';
      this.connection.socket = new WebSocket(wsUrl);
      
      this.connection.socket.onopen = () => {
        console.log('Connected to real-time server');
        this.connection.isConnected = true;
        this.connection.reconnectAttempts = 0;
        this.authenticateConnection();
      };

      this.connection.socket.onmessage = (event) => {
        try {
          this.handleMessage(JSON.parse(event.data));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.connection.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.connection.socket.onclose = (event) => {
        console.log('Disconnected from real-time server', event.code, event.reason);
        this.connection.isConnected = false;
        this.attemptReconnect();
      };

      return true;
    } catch (error) {
      console.error('Failed to connect to real-time server:', error);
      return false;
    }
  }

  private async authenticateConnection() {
    try {
      // Cookie-based authentication - send auth request
      // The backend will authenticate using httpOnly cookies
      const authMessage = {
        type: 'auth',
        timestamp: Date.now()
      };
      
      this.send(authMessage);
    } catch (error) {
      console.error('Failed to authenticate WebSocket connection:', error);
    }
  }

  private handleMessage(message: any) {
    try {
      const { type, channel, data, error } = message;
      
      // Handle authentication response
      if (type === 'auth_response') {
        if (error) {
          console.error('WebSocket authentication failed:', error);
          this.disconnect();
          return;
        }
        console.log('WebSocket authenticated successfully');
        return;
      }

      // Handle subscription confirmations
      if (type === 'subscription_confirmed') {
        console.log(`Subscribed to channel: ${channel}`);
        return;
      }

      // Handle regular messages
      if (channel) {
        const subscribers = this.connection.subscriptions.get(channel) || [];
        subscribers.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error in subscription callback:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  subscribe(channel: string, callback: Function): () => void {
    if (!this.connection.subscriptions.has(channel)) {
      this.connection.subscriptions.set(channel, []);
    }
    this.connection.subscriptions.get(channel)!.push(callback);

    // Subscribe to channel if connected
    if (this.connection.isConnected) {
      this.send({
        type: 'subscribe',
        channel
      });
    }

    // Return unsubscribe function
    return () => this.unsubscribe(channel, callback);
  }

  unsubscribe(channel: string, callback?: Function) {
    if (callback) {
      const subscribers = this.connection.subscriptions.get(channel) || [];
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
        
        // If no more subscribers for this channel, unsubscribe from server
        if (subscribers.length === 0) {
          this.connection.subscriptions.delete(channel);
          this.send({
            type: 'unsubscribe',
            channel
          });
        }
      }
    } else {
      this.connection.subscriptions.delete(channel);
      this.send({
        type: 'unsubscribe',
        channel
      });
    }
  }

  send(message: any): boolean {
    if (this.connection.isConnected && this.connection.socket) {
      try {
        this.connection.socket.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    }
    
    console.warn('Cannot send message: WebSocket not connected');
    return false;
  }

  private attemptReconnect() {
    if (this.connection.reconnectAttempts >= this.connection.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.connection.reconnectAttempts++;
    
    // Exponential backoff with jitter
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.connection.reconnectAttempts - 1) + 
      Math.random() * 1000,
      this.maxReconnectInterval
    );

    setTimeout(() => {
      if (!this.connection.isConnected) {
        console.log(`Attempting to reconnect (${this.connection.reconnectAttempts}/${this.connection.maxReconnectAttempts})...`);
        this.connect().then(connected => {
          if (connected) {
            // Resubscribe to all channels
            this.resubscribeToChannels();
          }
        });
      }
    }, delay);
  }

  private resubscribeToChannels() {
    // Resubscribe to all active channels after reconnection
    for (const channel of this.connection.subscriptions.keys()) {
      this.send({
        type: 'subscribe',
        channel
      });
    }
  }

  disconnect() {
    if (this.connection.socket) {
      this.connection.socket.close(1000, 'Client initiated disconnect');
      this.connection.socket = null;
    }
    this.connection.isConnected = false;
    this.connection.subscriptions.clear();
    this.connection.reconnectAttempts = 0;
  }

  // Utility methods
  isConnected(): boolean {
    return this.connection.isConnected;
  }

  getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    subscribedChannels: string[];
  } {
    return {
      connected: this.connection.isConnected,
      reconnectAttempts: this.connection.reconnectAttempts,
      subscribedChannels: Array.from(this.connection.subscriptions.keys())
    };
  }

  // Method to handle authentication errors and logout
  handleAuthError() {
    console.log('Authentication error detected, disconnecting WebSocket');
    this.disconnect();
  }
}

export const realTimeService = new RealTimeService();