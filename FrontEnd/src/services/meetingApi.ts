// import { DATABASE_CONFIG } from '@/config/database';
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

// class MeetingApiService {
//   private baseUrl = `http://${DATABASE_CONFIG.host}:3000/api/meetings`;

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

//   async createMeeting(data: CreateMeetingRequest): Promise<MeetingRoom> {
//     try {
//       // Primary: PostgreSQL backend
//       const response = await fetch(`${this.baseUrl}/create`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
//         },
//         body: JSON.stringify(data)
//       });

//       if (!response.ok) throw new Error('Failed to create meeting');

//       const meeting = await response.json();

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
//       // Primary: PostgreSQL backend
//       const response = await fetch(`${this.baseUrl}/${meetingId}`, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
//         }
//       });

//       if (!response.ok) throw new Error('Meeting not found');

//       return await response.json();
//     } catch (error) {
//       console.error('Primary meeting fetch failed, using fallback:', error);
//       return localMeetingFallback.getMeeting(meetingId);
//     }
//   }

//   async joinMeeting(data: JoinMeetingRequest): Promise<{ success: boolean; token?: string }> {
//     try {
//       // Primary: PostgreSQL backend
//       const response = await fetch(`${this.baseUrl}/${data.meetingId}/join`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
//         },
//         body: JSON.stringify(data)
//       });

//       if (!response.ok) throw new Error('Failed to join meeting');

//       const result = await response.json();

//       // Subscribe to meeting events
//       realTimeService.subscribe(`meeting:${data.meetingId}:participants`, (update) => {
//         console.log('Participant update:', update);
//       });

//       return result;
//     } catch (error) {
//       console.error('Primary meeting join failed, using fallback:', error);
//       return localMeetingFallback.joinMeeting(data);
//     }
//   }

//   async leaveMeeting(meetingId: string, participantId: string): Promise<void> {
//     console.log(`Participant ${participantId} left meeting ${meetingId}`);
//   }

//   async endMeeting(meetingId: string): Promise<void> {
//     if (this.mockMeetings.has(meetingId)) {
//       const meeting = this.mockMeetings.get(meetingId)!;
//       meeting.isActive = false;
//       this.mockMeetings.set(meetingId, meeting);
//     }
//     console.log(`Meeting ${meetingId} ended`);
//   }

//   generateMeetingLink(meetingId: string): string {
//     return `${window.location.origin}/meeting/${meetingId}`;
//   }

//   // Get all demo meetings for testing
//   getTestMeetings(): MeetingRoom[] {
//     return Array.from(this.mockMeetings.values());
//   }

//   // For demo purposes - replace with actual API calls
//   async mockCreateMeeting(data: CreateMeetingRequest): Promise<MeetingRoom> {
//     const meetingId = this.generateMeetingId();
//     const meeting: MeetingRoom = {
//       id: meetingId,
//       name: data.name,
//       hostId: 'host_' + Date.now(),
//       hostName: data.hostName,
//       isPublic: data.isPublic,
//       password: data.password,
//       maxParticipants: data.maxParticipants || 50,
//       createdAt: new Date().toISOString(),
//       expiresAt: data.duration ? new Date(Date.now() + data.duration * 60000).toISOString() : undefined,
//       isActive: true,
//     };

//     // Store in mock storage
//     this.mockMeetings.set(meetingId, meeting);

//     return meeting;
//   }

//   private generateMeetingId(): string {
//     const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
//     const segments = [];

//     for (let i = 0; i < 3; i++) {
//       let segment = '';
//       for (let j = 0; j < 3; j++) {
//         segment += chars.charAt(Math.floor(Math.random() * chars.length));
//       }
//       segments.push(segment);
//     }

//     return segments.join('-');
//   }

//   private mockMeetings = new Map<string, MeetingRoom>();

//   private initializeTestMeetings() {
//     const testMeetings = [
//       {
//         id: 'test-123',
//         name: 'Test Meeting Room',
//         hostId: 'host_1',
//         hostName: 'Demo Host',
//         isPublic: true,
//         maxParticipants: 10,
//         createdAt: new Date().toISOString(),
//         isActive: true,
//       },
//       {
//         id: 'demo-456',
//         name: 'Demo Conference Call',
//         hostId: 'host_2',
//         hostName: 'Conference Admin',
//         isPublic: false,
//         password: 'demo123',
//         maxParticipants: 25,
//         createdAt: new Date().toISOString(),
//         isActive: true,
//       },
//       {
//         id: 'team-789',
//         name: 'Team Standup',
//         hostId: 'host_3',
//         hostName: 'Team Lead',
//         isPublic: true,
//         maxParticipants: 15,
//         createdAt: new Date().toISOString(),
//         expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
//         isActive: true,
//       }
//     ];

//     testMeetings.forEach(meeting => {
//       this.mockMeetings.set(meeting.id, meeting as MeetingRoom);
//     });

//     console.log('Demo meetings initialized:', Array.from(this.mockMeetings.values()));
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
  private baseUrl = `${import.meta.env.VITE_SERVER_URL}/api/meetings`;

  constructor() {
    // Connect to real-time service on initialization
    this.initializeRealTime();
  }

  private async initializeRealTime() {
    const connected = await realTimeService.connect();
    if (!connected) {
      console.warn('Real-time connection failed, using local fallback');
    }
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
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
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
      // Primary: PostgreSQL backend with cookie auth
      const response = await fetch(
        `${this.baseUrl}/create`, // Updated endpoint
        this.getFetchConfig('POST', data)
      );

      const meeting = await this.handleApiResponse<MeetingRoom>(response);

      // Subscribe to real-time updates
      realTimeService.subscribe(`meeting:${meeting.id}`, (update) => {
        console.log('Meeting update:', update);
      });

      return meeting;
    } catch (error) {
      console.error('Primary meeting creation failed, using fallback:', error);
      return localMeetingFallback.createMeeting(data);
    }
  }

  async getMeeting(meetingId: string): Promise<MeetingRoom | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${meetingId}`,
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
      const response = await fetch(
        `${this.baseUrl}/${data.meetingId}/join`,
        this.getFetchConfig('POST', { 
          participantName: data.participantName, 
          password: data.password 
        })
      );

      const result = await this.handleApiResponse<{ token: string; participantId: string }>(response);

      // Subscribe to meeting events
      realTimeService.subscribe(`meeting:${data.meetingId}:participants`, (update) => {
        console.log('Participant update:', update);
      });

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
      await fetch(
        `${this.baseUrl}/${meetingId}/leave`,
        this.getFetchConfig('POST', { participantId })
      );
      
      console.log(`Participant ${participantId} left meeting ${meetingId}`);
    } catch (error) {
      console.error('Failed to leave meeting:', error);
    }
  }

  async endMeeting(meetingId: string): Promise<void> {
    try {
      await fetch(
        `${this.baseUrl}/${meetingId}/end`,
        this.getFetchConfig('POST')
      );
      
      console.log(`Meeting ${meetingId} ended`);
    } catch (error) {
      console.error('Failed to end meeting:', error);
    }
  }

  async getParticipants(meetingId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${meetingId}/participants`,
        this.getFetchConfig('GET')
      );

      return await this.handleApiResponse<any[]>(response);
    } catch (error) {
      console.error('Failed to get participants:', error);
      return [];
    }
  }

  generateMeetingLink(meetingId: string): string {
    return `${window.location.origin}/meeting/${meetingId}`;
  }

  // WebRTC signaling methods
  async sendSignal(meetingId: string, signal: any): Promise<void> {
    try {
      // Primary: Send via WebSocket real-time
      realTimeService.send({
        type: 'webrtc_signal',
        meetingId,
        signal
      });
    } catch (error) {
      console.error('Failed to send WebRTC signal:', error);
    }
  }

  subscribeToSignals(meetingId: string, callback: (signal: any) => void) {
    realTimeService.subscribe(`meeting:${meetingId}:webrtc`, callback);
  }

  // Authentication check method
  async checkAuth(): Promise<boolean> {
    try {
      const response = await fetch(
        `http://localhost:4000/api/auth/check`, // Updated to match your auth structure
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
        `http://localhost:4000/api/auth/refresh`,
        this.getFetchConfig('POST')
      );
      return response.ok;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
}

export const meetingApi = new MeetingApiService();