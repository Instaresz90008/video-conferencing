
import { MeetingRoom } from "@/services/meetingApi";
import { Service, Channel, ChatMessage, VoiceMemo, CodeSnippet, CollaborativeBoard } from "@/types/chat";

interface LocalStorageData {
  theme: 'light' | 'dark' | 'system';
  meetings: MeetingRoom[];
  services: Service[];
  channels: Channel[];
  messages: Record<string, ChatMessage[]>;
  voiceMemos: VoiceMemo[];
  codeSnippets: CodeSnippet[];
  boards: CollaborativeBoard[];
  language: string;
  [key: string]: any;
}

// Demo meeting data
const DEMO_MEETINGS: MeetingRoom[] = [
  {
    id: 'mpi-lvg-1yn',
    name: 'Product Strategy Session',
    hostId: 'host-1',
    hostName: 'Sarah Johnson',
    isPublic: true,
    isActive: true,
    maxParticipants: 25,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    password: undefined
  },
  {
    id: 'demo-meeting-123',
    name: 'Weekly Team Standup',
    hostId: 'host-2',
    hostName: 'Michael Chen',
    isPublic: false,
    isActive: true,
    maxParticipants: 15,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    password: 'team123'
  },
  {
    id: 'client-demo-456',
    name: 'Client Presentation Demo',
    hostId: 'host-3',  
    hostName: 'Emma Wilson',
    isPublic: true,
    isActive: true,
    maxParticipants: 50,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    password: undefined
  }
];

// Demo services data
export const DEMO_SERVICES: Service[] = [
  {
    id: 'service-1',
    name: 'Development Team',
    description: 'Frontend and backend development discussions',
    category: 'development',
    color: '#3b82f6',
    icon: 'code',
    isActive: true,
    memberCount: 12
  },
  {
    id: 'service-2',
    name: 'Design Team',
    description: 'UI/UX design collaboration',
    category: 'design',
    color: '#f59e0b',
    icon: 'palette',
    isActive: true,
    memberCount: 8
  }
];

// Demo channels data
export const DEMO_CHANNELS: Channel[] = [
  {
    id: 'channel-1',
    name: 'general',
    type: 'service',
    serviceId: 'service-1',
    description: 'General development discussions',
    isPrivate: false,
    memberCount: 12,
    lastActivity: new Date().toISOString(),
    unreadCount: 0
  },
  {
    id: 'channel-2',
    name: 'design-review',
    type: 'service',
    serviceId: 'service-2',
    description: 'Design reviews and feedback',
    isPrivate: false,
    memberCount: 8,
    lastActivity: new Date().toISOString(),
    unreadCount: 3
  }
];

export class LocalStorageManager {
  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) as T : defaultValue;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }

  static initializeDemoData(): void {
    // Initialize demo meetings if they don't exist
    const existingMeetings = this.get<MeetingRoom[]>('meetings', []);
    if (existingMeetings.length === 0) {
      this.set('meetings', DEMO_MEETINGS);
      console.log('Demo meetings initialized:', DEMO_MEETINGS);
    }

    // Initialize demo services
    const existingServices = this.get<Service[]>('services', []);
    if (existingServices.length === 0) {
      this.set('services', DEMO_SERVICES);
    }

    // Initialize demo channels
    const existingChannels = this.get<Channel[]>('channels', []);
    if (existingChannels.length === 0) {
      this.set('channels', DEMO_CHANNELS);
    }

    // Initialize other demo data here if needed
    const initialTheme = this.get<LocalStorageData['theme']>('theme', 'system');
    this.set('theme', initialTheme);

    // Initialize language
    const initialLanguage = this.get<string>('language', 'en');
    this.set('language', initialLanguage);
  }

  // Meeting methods
  static setMeeting(meeting: MeetingRoom): void {
    const meetings = this.get<MeetingRoom[]>('meetings', []);
    const existingIndex = meetings.findIndex(m => m.id === meeting.id);

    if (existingIndex > -1) {
      meetings[existingIndex] = meeting;
    } else {
      meetings.push(meeting);
    }

    this.set('meetings', meetings);
  }

  static getMeeting(meetingId: string): MeetingRoom | undefined {
    const meetings = this.get<MeetingRoom[]>('meetings', []);
    return meetings.find(m => m.id === meetingId);
  }

  static removeMeeting(meetingId: string): void {
    let meetings = this.get<MeetingRoom[]>('meetings', []);
    meetings = meetings.filter(m => m.id !== meetingId);
    this.set('meetings', meetings);
  }

  // Theme methods
  static saveTheme(theme: 'light' | 'dark' | 'system'): void {
    this.set('theme', theme);
  }

  static getTheme(): 'light' | 'dark' | 'system' {
    return this.get<'light' | 'dark' | 'system'>('theme', 'system');
  }

  // Service methods
  static getServices(): Service[] {
    return this.get<Service[]>('services', []);
  }

  static saveServices(services: Service[]): void {
    this.set('services', services);
  }

  // Channel methods
  static getChannels(): Channel[] {
    return this.get<Channel[]>('channels', []);
  }

  static saveChannels(channels: Channel[]): void {
    this.set('channels', channels);
  }

  // Message methods
  static getMessages(channelId: string): ChatMessage[] {
    const allMessages = this.get<Record<string, ChatMessage[]>>('messages', {});
    return allMessages[channelId] || [];
  }

  static saveMessage(message: ChatMessage): void {
    const allMessages = this.get<Record<string, ChatMessage[]>>('messages', {});
    if (!allMessages[message.channelId]) {
      allMessages[message.channelId] = [];
    }
    allMessages[message.channelId].push(message);
    this.set('messages', allMessages);
  }

  // Voice memo methods
  static saveVoiceMemo(voiceMemo: VoiceMemo): void {
    const voiceMemos = this.get<VoiceMemo[]>('voiceMemos', []);
    voiceMemos.push(voiceMemo);
    this.set('voiceMemos', voiceMemos);
  }

  static getVoiceMemos(): VoiceMemo[] {
    return this.get<VoiceMemo[]>('voiceMemos', []);
  }

  // Code snippet methods
  static saveCodeSnippet(codeSnippet: CodeSnippet): void {
    const codeSnippets = this.get<CodeSnippet[]>('codeSnippets', []);
    codeSnippets.push(codeSnippet);
    this.set('codeSnippets', codeSnippets);
  }

  static getCodeSnippets(): CodeSnippet[] {
    return this.get<CodeSnippet[]>('codeSnippets', []);
  }

  // Board methods
  static saveBoard(board: CollaborativeBoard): void {
    const boards = this.get<CollaborativeBoard[]>('boards', []);
    const existingIndex = boards.findIndex(b => b.id === board.id);
    
    if (existingIndex > -1) {
      boards[existingIndex] = board;
    } else {
      boards.push(board);
    }
    
    this.set('boards', boards);
  }

  static getBoards(): CollaborativeBoard[] {
    return this.get<CollaborativeBoard[]>('boards', []);
  }

  // Language methods
  static saveLanguage(language: string): void {
    this.set('language', language);
  }

  static getLanguage(): string {
    return this.get<string>('language', 'en');
  }
}

export const localStorageManager = LocalStorageManager;
