// import { realTimeService } from '@/services/realTimeService';
// import { localMeetingFallback } from '@/services/fallback/localMeeting';

// // API service for meeting operations
// export interface MeetingRoom {
//   id: string;
//   name: string;
//   hostId: string;
//   hostName: string;
//   isPublic: boolean;
//   password?: string;
//   maxParticipants: number;
//   createdAt: string;
//   expiresAt?: string;
//   isActive: boolean;
// }

// export interface CreateMeetingRequest {
//   name: string;
//   hostName: string;
//   isPublic: boolean;
//   password?: string;
//   maxParticipants?: number;
//   duration?: number; // in minutes
// }

// export interface JoinMeetingRequest {
//   meetingId: string;
//   participantName: string;
//   password?: string;
// }

// export interface ApiResponse<T> {
//   success: boolean;
//   message?: string;
//   data?: T;
//   error?: string;
// }

// class MeetingApiService {
//   // Use consistent base URL for all API calls
//   private baseUrl = `${import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'}/api`;

//   constructor() {
//     // Connect to real-time service on initialization
//     this.initializeRealTime();
//   }

//   private async initializeRealTime() {
//     const connected = await realTimeService.connect();
//     if (!connected) {
//       console.warn('Real-time connection failed, using local fallback');
//     }
//   }

//   // Common fetch configuration for cookie authentication
//   private getFetchConfig(method: string, body?: any): RequestInit {
//     const config: RequestInit = {
//       method,
//       credentials: 'include', // Use cookies instead of localStorage
//       headers: {
//         'Content-Type': 'application/json',
//         'Cache-Control': 'no-cache'
//       }
//     };

//     if (body) {
//       config.body = JSON.stringify(body);
//     }

//     return config;
//   }

//   private async handleApiResponse<T>(response: Response): Promise<T> {
//     if (!response.ok) {
//       let errorData;
//       try {
//         errorData = await response.json();
//       } catch {
//         errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
//       }
//       throw new Error(errorData.error || 'API request failed');
//     }

//     const result = await response.json() as ApiResponse<T>;
    
//     if (result.success && result.data) {
//       return result.data;
//     }

//     // Handle responses that don't follow the success/data pattern (for backward compatibility)
//     return result as unknown as T;
//   }

//   async createMeeting(data: CreateMeetingRequest): Promise<MeetingRoom> {
//     try {
//       console.log('Creating meeting with data:', data);
      
//       // Primary: PostgreSQL backend with cookie auth
//       const response = await fetch(
//         `${this.baseUrl}/meetings/create`,
//         this.getFetchConfig('POST', data)
//       );

//       const meeting = await this.handleApiResponse<MeetingRoom>(response);

//       console.log('Meeting created successfully:', meeting);

//       // Subscribe to real-time updates
//       realTimeService.subscribe(`meeting:${meeting.id}`, (update) => {
//         console.log('Meeting update:', update);
//       });

//       return meeting;
//     } catch (error) {
//       console.error('Primary meeting creation failed, using fallback:', error);
//       return localMeetingFallback.createMeeting(data);
//     }
//   }

//   async getMeeting(meetingId: string): Promise<MeetingRoom | null> {
//     try {
//       // Validate and encode meeting ID properly
//       if (!meetingId || typeof meetingId !== 'string') {
//         throw new Error('Invalid meeting ID');
//       }

//       // Ensure the meeting ID is properly encoded for URL
//       const encodedMeetingId = encodeURIComponent(meetingId.trim());
      
//       console.log('Fetching meeting:', { original: meetingId, encoded: encodedMeetingId });

//       const response = await fetch(
//         `${this.baseUrl}/meetings/${encodedMeetingId}`,
//         this.getFetchConfig('GET')
//       );

//       return await this.handleApiResponse<MeetingRoom>(response);
//     } catch (error) {
//       console.error('Primary meeting fetch failed, using fallback:', error);
//       return localMeetingFallback.getMeeting(meetingId);
//     }
//   }

//   async joinMeeting(data: JoinMeetingRequest): Promise<{ success: boolean; token?: string; participantId?: string }> {
//     try {
//       // Validate meeting ID
//       if (!data.meetingId || typeof data.meetingId !== 'string') {
//         throw new Error('Invalid meeting ID');
//       }

//       const encodedMeetingId = encodeURIComponent(data.meetingId.trim());
      
//       console.log('Joining meeting:', { 
//         original: data.meetingId, 
//         encoded: encodedMeetingId,
//         participantName: data.participantName 
//       });

//       const response = await fetch(
//         `${this.baseUrl}/meetings/${encodedMeetingId}/join`,
//         this.getFetchConfig('POST', { 
//           participantName: data.participantName, 
//           password: data.password 
//         })
//       );

//       const result = await this.handleApiResponse<{ token: string; participantId: string }>(response);

//       // Subscribe to meeting events
//       realTimeService.subscribe(`meeting:${data.meetingId}:participants`, (update) => {
//         console.log('Participant update:', update);
//       });

//       return {
//         success: true,
//         token: result.token,
//         participantId: result.participantId
//       };
//     } catch (error) {
//       console.error('Primary meeting join failed, using fallback:', error);
//       return localMeetingFallback.joinMeeting(data);
//     }
//   }

//   async leaveMeeting(meetingId: string, participantId: string): Promise<void> {
//     try {
//       const encodedMeetingId = encodeURIComponent(meetingId.trim());
      
//       await fetch(
//         `${this.baseUrl}/meetings/${encodedMeetingId}/leave`,
//         this.getFetchConfig('POST', { participantId })
//       );
      
//       console.log(`Participant ${participantId} left meeting ${meetingId}`);
//     } catch (error) {
//       console.error('Failed to leave meeting:', error);
//     }
//   }

//   async endMeeting(meetingId: string): Promise<void> {
//     try {
//       const encodedMeetingId = encodeURIComponent(meetingId.trim());
      
//       await fetch(
//         `${this.baseUrl}/meetings/${encodedMeetingId}/end`,
//         this.getFetchConfig('POST')
//       );
      
//       console.log(`Meeting ${meetingId} ended`);
//     } catch (error) {
//       console.error('Failed to end meeting:', error);
//     }
//   }

//   async getParticipants(meetingId: string): Promise<any[]> {
//     try {
//       const encodedMeetingId = encodeURIComponent(meetingId.trim());
      
//       const response = await fetch(
//         `${this.baseUrl}/meetings/${encodedMeetingId}/participants`,
//         this.getFetchConfig('GET')
//       );

//       return await this.handleApiResponse<any[]>(response);
//     } catch (error) {
//       console.error('Failed to get participants:', error);
//       return [];
//     }
//   }

//   generateMeetingLink(meetingId: string): string {
//     return `${window.location.origin}/meeting/${encodeURIComponent(meetingId)}`;
//   }

//   // WebRTC signaling methods
//   async sendSignal(meetingId: string, signal: any): Promise<void> {
//     try {
//       // Primary: Send via WebSocket real-time
//       realTimeService.send({
//         type: 'webrtc_signal',
//         meetingId,
//         signal
//       });
//     } catch (error) {
//       console.error('Failed to send WebRTC signal:', error);
//     }
//   }

//   subscribeToSignals(meetingId: string, callback: (signal: any) => void) {
//     realTimeService.subscribe(`meeting:${meetingId}:webrtc`, callback);
//   }

//   // Authentication check method
//   async checkAuth(): Promise<boolean> {
//     try {
//       const response = await fetch(
//         `${this.baseUrl}/auth/check`,
//         this.getFetchConfig('GET')
//       );
//       return response.ok;
//     } catch (error) {
//       console.error('Auth check failed:', error);
//       return false;
//     }
//   }

//   // Utility method to handle token refresh if needed
//   async refreshAuthIfNeeded(): Promise<boolean> {
//     try {
//       const response = await fetch(
//         `${this.baseUrl}/auth/refresh`,
//         this.getFetchConfig('POST')
//       );
//       return response.ok;
//     } catch (error) {
//       console.error('Token refresh failed:', error);
//       return false;
//     }
//   }

//   // Helper method to validate meeting ID format
//   isValidMeetingId(meetingId: string): boolean {
//     // Meeting IDs should be in format: abc-def-ghi (3 segments of 3 chars each)
//     const meetingIdPattern = /^[a-z0-9]{3}-[a-z0-9]{3}-[a-z0-9]{3}$/;
//     return meetingIdPattern.test(meetingId);
//   }

//   // Helper method to extract meeting ID from various inputs
//   extractMeetingId(input: string): string | null {
//     // If it's already a valid meeting ID, return it
//     if (this.isValidMeetingId(input)) {
//       return input;
//     }

//     // Try to extract from URL if it's a meeting link
//     try {
//       const url = new URL(input);
//       const pathParts = url.pathname.split('/');
//       const lastPart = pathParts[pathParts.length - 1];
//       if (this.isValidMeetingId(lastPart)) {
//         return lastPart;
//       }
//     } catch {
//       // Not a valid URL, continue
//     }

//     // If no valid ID found, return null
//     return null;
//   }
// }

// export const meetingApi = new MeetingApiService();






























import { realTimeService } from '@/services/realTimeService';
import { localMeetingFallback } from '@/services/fallback/localMeeting';

// API service for meeting operations
export interface MeetingRoom {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  isPublic: boolean;
  password?: string;
  maxParticipants: number;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface CreateMeetingRequest {
  name: string;
  hostName: string;
  isPublic: boolean;
  password?: string;
  maxParticipants?: number;
  duration?: number; // in minutes
}

export interface JoinMeetingRequest {
  meetingId: string;
  participantName: string;
  password?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class MeetingApiService {
  private static instance: MeetingApiService;
  private baseUrl = `${import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'}/api`;
  private realTimeConnectionPromise: Promise<boolean> | null = null;
  private realTimeInitialized = false;
  private connectionTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    // Don't initialize real-time in constructor to prevent connection churn
  }

  static getInstance(): MeetingApiService {
    if (!MeetingApiService.instance) {
      MeetingApiService.instance = new MeetingApiService();
    }
    return MeetingApiService.instance;
  }

  private async ensureRealTimeConnection(): Promise<boolean> {
    if (this.realTimeInitialized) {
      return true;
    }

    if (!this.realTimeConnectionPromise) {
      // Debounce connection attempts to prevent rapid reconnections
      this.realTimeConnectionPromise = new Promise((resolve) => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
        }

        this.connectionTimeout = setTimeout(async () => {
          try {
            const connected = await realTimeService.connect();
            this.realTimeInitialized = connected;
            if (!connected) {
              console.warn('Real-time connection failed, using local fallback');
            }
            resolve(connected);
          } catch (error) {
            console.error('Real-time connection error:', error);
            resolve(false);
          }
        }, 100); // 100ms debounce
      });
    }

    return this.realTimeConnectionPromise;
  }

  // Common fetch configuration for cookie authentication
  private getFetchConfig(method: string, body?: any): RequestInit {
    const config: RequestInit = {
      method,
      credentials: 'include', // Use cookies instead of localStorage
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    return config;
  }

  private async handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      throw new Error(errorData.error || 'API request failed');
    }

    const result = await response.json() as ApiResponse<T>;
    
    if (result.success && result.data) {
      return result.data;
    }

    // Handle responses that don't follow the success/data pattern (for backward compatibility)
    return result as unknown as T;
  }

  async createMeeting(data: CreateMeetingRequest): Promise<MeetingRoom> {
    try {
      console.log('Creating meeting with data:', data);
      
      // Ensure auth is valid before proceeding
      const isAuthenticated = await this.checkAuth();
      if (!isAuthenticated) {
        const refreshed = await this.refreshAuthIfNeeded();
        if (!refreshed) {
          throw new Error('Authentication failed');
        }
      }

      // Primary: PostgreSQL backend with cookie auth
      const response = await fetch(
        `${this.baseUrl}/meetings/create`,
        this.getFetchConfig('POST', data)
      );

      const meeting = await this.handleApiResponse<MeetingRoom>(response);

      console.log('Meeting created successfully:', meeting);

      // Only initialize real-time after successful meeting creation
      const realTimeConnected = await this.ensureRealTimeConnection();
      
      // Subscribe to real-time updates only if connection is available
      if (realTimeConnected) {
        realTimeService.subscribe(`meeting:${meeting.id}`, (update) => {
          console.log('Meeting update:', update);
        });
      }

      return meeting;
    } catch (error) {
      console.error('Primary meeting creation failed, using fallback:', error);
      return localMeetingFallback.createMeeting(data);
    }
  }

  async getMeeting(meetingId: string): Promise<MeetingRoom | null> {
    try {
      // Always validate and extract proper meeting ID first
      const validMeetingId = this.extractMeetingId(meetingId);
      if (!validMeetingId) {
        throw new Error(`Invalid meeting ID format: ${meetingId}`);
      }

      // Ensure the meeting ID is properly encoded for URL
      const encodedMeetingId = encodeURIComponent(validMeetingId);
      
      console.log('Fetching meeting:', { original: meetingId, validated: validMeetingId, encoded: encodedMeetingId });

      const response = await fetch(
        `${this.baseUrl}/meetings/${encodedMeetingId}`,
        this.getFetchConfig('GET')
      );

      return await this.handleApiResponse<MeetingRoom>(response);
    } catch (error) {
      console.error('Primary meeting fetch failed, using fallback:', error);
      return localMeetingFallback.getMeeting(meetingId);
    }
  }

  async joinMeeting(data: JoinMeetingRequest): Promise<{ success: boolean; token?: string; participantId?: string }> {
    try {
      // Validate and extract proper meeting ID
      const validMeetingId = this.extractMeetingId(data.meetingId);
      if (!validMeetingId) {
        throw new Error(`Invalid meeting ID format: ${data.meetingId}`);
      }

      const encodedMeetingId = encodeURIComponent(validMeetingId);
      
      console.log('Joining meeting:', { 
        original: data.meetingId, 
        validated: validMeetingId,
        encoded: encodedMeetingId,
        participantName: data.participantName 
      });

      const response = await fetch(
        `${this.baseUrl}/meetings/${encodedMeetingId}/join`,
        this.getFetchConfig('POST', { 
          participantName: data.participantName, 
          password: data.password 
        })
      );

      const result = await this.handleApiResponse<{ token: string; participantId: string }>(response);

      // Ensure real-time connection before subscribing
      const realTimeConnected = await this.ensureRealTimeConnection();
      
      // Subscribe to meeting events only if real-time is available
      if (realTimeConnected) {
        realTimeService.subscribe(`meeting:${validMeetingId}:participants`, (update) => {
          console.log('Participant update:', update);
        });
      }

      return {
        success: true,
        token: result.token,
        participantId: result.participantId
      };
    } catch (error) {
      console.error('Primary meeting join failed, using fallback:', error);
      return localMeetingFallback.joinMeeting(data);
    }
  }

  async leaveMeeting(meetingId: string, participantId: string): Promise<void> {
    try {
      const validMeetingId = this.extractMeetingId(meetingId);
      if (!validMeetingId) {
        throw new Error(`Invalid meeting ID format: ${meetingId}`);
      }

      const encodedMeetingId = encodeURIComponent(validMeetingId);
      
      await fetch(
        `${this.baseUrl}/meetings/${encodedMeetingId}/leave`,
        this.getFetchConfig('POST', { participantId })
      );
      
      console.log(`Participant ${participantId} left meeting ${validMeetingId}`);
    } catch (error) {
      console.error('Failed to leave meeting:', error);
    }
  }

  async endMeeting(meetingId: string): Promise<void> {
    try {
      const validMeetingId = this.extractMeetingId(meetingId);
      if (!validMeetingId) {
        throw new Error(`Invalid meeting ID format: ${meetingId}`);
      }

      const encodedMeetingId = encodeURIComponent(validMeetingId);
      
      await fetch(
        `${this.baseUrl}/meetings/${encodedMeetingId}/end`,
        this.getFetchConfig('POST')
      );
      
      console.log(`Meeting ${validMeetingId} ended`);
    } catch (error) {
      console.error('Failed to end meeting:', error);
    }
  }

  async getParticipants(meetingId: string): Promise<any[]> {
    try {
      const validMeetingId = this.extractMeetingId(meetingId);
      if (!validMeetingId) {
        throw new Error(`Invalid meeting ID format: ${meetingId}`);
      }

      const encodedMeetingId = encodeURIComponent(validMeetingId);
      
      const response = await fetch(
        `${this.baseUrl}/meetings/${encodedMeetingId}/participants`,
        this.getFetchConfig('GET')
      );

      return await this.handleApiResponse<any[]>(response);
    } catch (error) {
      console.error('Failed to get participants:', error);
      return [];
    }
  }

  generateMeetingLink(meetingId: string): string {
    const validMeetingId = this.extractMeetingId(meetingId);
    if (!validMeetingId) {
      console.error('Cannot generate link for invalid meeting ID:', meetingId);
      return `${window.location.origin}/meeting/invalid`;
    }
    return `${window.location.origin}/meeting/${encodeURIComponent(validMeetingId)}`;
  }

  // WebRTC signaling methods
  async sendSignal(meetingId: string, signal: any): Promise<void> {
    try {
      const validMeetingId = this.extractMeetingId(meetingId);
      if (!validMeetingId) {
        throw new Error(`Invalid meeting ID format: ${meetingId}`);
      }

      // Ensure real-time connection before sending signals
      const realTimeConnected = await this.ensureRealTimeConnection();
      if (!realTimeConnected) {
        throw new Error('Real-time connection not available for WebRTC signaling');
      }

      // Primary: Send via WebSocket real-time
      realTimeService.send({
        type: 'webrtc_signal',
        meetingId: validMeetingId,
        signal
      });
    } catch (error) {
      console.error('Failed to send WebRTC signal:', error);
    }
  }

  async subscribeToSignals(meetingId: string, callback: (signal: any) => void): Promise<void> {
    const validMeetingId = this.extractMeetingId(meetingId);
    if (!validMeetingId) {
      console.error('Cannot subscribe to signals for invalid meeting ID:', meetingId);
      return;
    }

    // Ensure real-time connection before subscribing
    const realTimeConnected = await this.ensureRealTimeConnection();
    if (realTimeConnected) {
      realTimeService.subscribe(`meeting:${validMeetingId}:webrtc`, callback);
    }
  }

  // Authentication check method
  async checkAuth(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/auth/check`,
        this.getFetchConfig('GET')
      );
      return response.ok;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }

  // Utility method to handle token refresh if needed
  async refreshAuthIfNeeded(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/auth/refresh`,
        this.getFetchConfig('POST')
      );
      return response.ok;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Helper method to validate meeting ID format
  isValidMeetingId(meetingId: string): boolean {
    // Meeting IDs should be in format: abc-def-ghi (3 segments of 3 chars each)
    const meetingIdPattern = /^[a-z0-9]{3}-[a-z0-9]{3}-[a-z0-9]{3}$/;
    return meetingIdPattern.test(meetingId);
  }

  // Helper method to extract meeting ID from various inputs
  extractMeetingId(input: string): string | null {
    if (!input || typeof input !== 'string') {
      return null;
    }

    const trimmedInput = input.trim();

    // If it's already a valid meeting ID, return it
    if (this.isValidMeetingId(trimmedInput)) {
      return trimmedInput;
    }

    // Try to extract from URL if it's a meeting link
    try {
      const url = new URL(trimmedInput);
      const pathParts = url.pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      if (this.isValidMeetingId(lastPart)) {
        return lastPart;
      }
    } catch {
      // Not a valid URL, continue
    }

    // Try to extract from hash fragment
    if (trimmedInput.includes('#')) {
      const hashPart = trimmedInput.split('#')[1];
      if (hashPart && this.isValidMeetingId(hashPart)) {
        return hashPart;
      }
    }

    // Log invalid meeting ID attempts for debugging
    console.warn('Invalid meeting ID format received:', input);
    
    // If no valid ID found, return null
    return null;
  }

  // Cleanup method to properly disconnect
  async cleanup(): Promise<void> {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    this.realTimeConnectionPromise = null;
    this.realTimeInitialized = false;

    try {
      await realTimeService.disconnect();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Export singleton instance
export const meetingApi = MeetingApiService.getInstance();