
export interface Service {
  id: string;
  name: string;
  description: string;
  category: 'development' | 'design' | 'marketing' | 'support' | 'general';
  color: string;
  icon: string;
  isActive: boolean;
  memberCount: number;
}

export interface Channel {
  id: string;
  name: string;
  type: 'service' | 'direct' | 'group';
  serviceId?: string;
  description?: string;
  isPrivate: boolean;
  memberCount: number;
  lastActivity: string;
  unreadCount: number;
}

export interface VoiceMemo {
  id: string;
  url: string;
  duration: number;
  transcript?: string;
  waveform: number[];
  createdAt: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  version: number;
  author: string;
  createdAt: string;
  updatedAt: string;
  collaborators: string[];
}

export interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface MessageThread {
  id: string;
  parentMessageId: string;
  replies: ChatMessage[];
  lastReply: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'away';
  };
  channelId: string;
  timestamp: string;
  type: 'text' | 'code' | 'voice' | 'file' | 'system';
  editedAt?: string;
  reactions: MessageReaction[];
  threadId?: string;
  replyTo?: string;
  mentions: string[];
  voiceMemo?: VoiceMemo;
  codeSnippet?: CodeSnippet;
  attachments?: FileAttachment[];
  isEncrypted: boolean;
  deliveryStatus: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  channelId: string;
  timestamp: string;
}

export interface CollaborativeBoard {
  id: string;
  name: string;
  type: 'code' | 'whiteboard' | 'spreadsheet';
  content: any;
  cursors: Record<string, { x: number; y: number; user: string; color: string }>;
  lastModified: string;
  collaborators: string[];
}
