
// LOCAL FALLBACK - DELETE THIS FOLDER WHEN BACKEND IS READY
import { MeetingRoom } from '@/services/meetingApi';

class LocalMeetingFallback {
  private meetings: Map<string, MeetingRoom> = new Map();

  constructor() {
    // Initialize with demo meetings
    const demoMeetings = [
      {
        id: 'demo-123',
        name: 'Demo Meeting',
        hostId: 'host_1',
        hostName: 'Demo Host',
        isPublic: true,
        maxParticipants: 10,
        createdAt: new Date().toISOString(),
        isActive: true,
      }
    ];

    demoMeetings.forEach(meeting => {
      this.meetings.set(meeting.id, meeting as MeetingRoom);
    });
  }

  async createMeeting(data: any): Promise<MeetingRoom> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const meeting: MeetingRoom = {
      id: `meeting_${Date.now()}`,
      name: data.name,
      hostId: `host_${Date.now()}`,
      hostName: data.hostName,
      isPublic: data.isPublic,
      password: data.password,
      maxParticipants: data.maxParticipants || 50,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    this.meetings.set(meeting.id, meeting);
    return meeting;
  }

  async getMeeting(meetingId: string): Promise<MeetingRoom | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.meetings.get(meetingId) || null;
  }

  async joinMeeting(data: any): Promise<{ success: boolean; token?: string }> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const meeting = this.meetings.get(data.meetingId);
    if (!meeting) throw new Error('Meeting not found');
    
    return {
      success: true,
      token: `local_token_${Date.now()}`
    };
  }
}

export const localMeetingFallback = new LocalMeetingFallback();
