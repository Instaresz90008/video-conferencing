
import { Service, Channel, ChatMessage, VoiceMemo, CodeSnippet, TypingIndicator, CollaborativeBoard } from '@/types/chat';
import { localStorageManager } from '@/lib/localStorage';

class ChatAPI {
  // Services API
  async getServices(): Promise<Service[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return localStorageManager.getServices();
  }

  async createService(service: Omit<Service, 'id'>): Promise<Service> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newService = { ...service, id: `service-${Date.now()}` };
    const services = localStorageManager.getServices();
    services.push(newService);
    localStorageManager.saveServices(services);
    return newService;
  }

  // Channels API
  async getChannels(serviceId?: string): Promise<Channel[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const channels = localStorageManager.getChannels();
    if (serviceId) {
      return channels.filter(c => c.serviceId === serviceId);
    }
    return channels;
  }

  async createChannel(channel: Omit<Channel, 'id'>): Promise<Channel> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newChannel = { ...channel, id: `channel-${Date.now()}` };
    const channels = localStorageManager.getChannels();
    channels.push(newChannel);
    localStorageManager.saveChannels(channels);
    return newChannel;
  }

  // Messages API
  async getMessages(channelId: string, limit = 50): Promise<ChatMessage[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return localStorageManager.getMessages(channelId);
  }

  async sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'deliveryStatus'>): Promise<ChatMessage> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      deliveryStatus: 'sent'
    };
    localStorageManager.saveMessage(newMessage);
    return newMessage;
  }

  // Voice Memo API
  async uploadVoiceMemo(audioBlob: Blob): Promise<VoiceMemo> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const voiceMemo: VoiceMemo = {
      id: `voice-${Date.now()}`,
      url: URL.createObjectURL(audioBlob),
      duration: 30,
      transcript: 'This is a sample transcript...',
      waveform: Array.from({ length: 50 }, () => Math.random()),
      createdAt: new Date().toISOString()
    };
    localStorageManager.saveVoiceMemo(voiceMemo);
    return voiceMemo;
  }

  async transcribeVoice(voiceId: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return 'This is a mock transcription of the voice memo.';
  }

  // Code Snippet API
  async saveCodeSnippet(code: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<CodeSnippet> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const codeSnippet: CodeSnippet = {
      ...code,
      id: `code-${Date.now()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorageManager.saveCodeSnippet(codeSnippet);
    return codeSnippet;
  }

  async getCodeVersions(codeId: string): Promise<CodeSnippet[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return localStorageManager.getCodeSnippets().filter(c => c.id.startsWith(codeId));
  }

  // Typing Indicators API
  async sendTypingIndicator(channelId: string, isTyping: boolean): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    // Mock typing indicator broadcast
  }

  async getTypingIndicators(channelId: string): Promise<TypingIndicator[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [];
  }

  // Collaborative Board API
  async createBoard(board: Omit<CollaborativeBoard, 'id' | 'lastModified' | 'cursors'>): Promise<CollaborativeBoard> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newBoard: CollaborativeBoard = {
      ...board,
      id: `board-${Date.now()}`,
      lastModified: new Date().toISOString(),
      cursors: {}
    };
    localStorageManager.saveBoard(newBoard);
    return newBoard;
  }

  async updateBoard(boardId: string, content: any): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const boards = localStorageManager.getBoards();
    const boardIndex = boards.findIndex(b => b.id === boardId);
    if (boardIndex >= 0) {
      boards[boardIndex] = { ...boards[boardIndex], content, lastModified: new Date().toISOString() };
      localStorageManager.saveBoard(boards[boardIndex]);
    }
  }

  async getBoardContent(boardId: string): Promise<CollaborativeBoard> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const boards = localStorageManager.getBoards();
    const board = boards.find(b => b.id === boardId);
    return board || {
      id: boardId,
      name: 'Collaborative Board',
      type: 'code',
      content: {},
      cursors: {},
      lastModified: new Date().toISOString(),
      collaborators: []
    };
  }

  // AI Features API
  async getSmartSuggestions(message: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      'Have you considered using TypeScript for better type safety?',
      'You might want to add error handling for this API call',
      'Consider using React.memo for performance optimization'
    ];
  }

  async translateMessage(message: string, targetLanguage: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `[Translated to ${targetLanguage}]: ${message}`;
  }

  // Search API
  async searchMessages(query: string, filters?: any): Promise<ChatMessage[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const allChannels = localStorageManager.getChannels();
    const results: ChatMessage[] = [];
    
    for (const channel of allChannels) {
      const messages = localStorageManager.getMessages(channel.id);
      const filteredMessages = messages.filter(msg =>
        msg.content.toLowerCase().includes(query.toLowerCase()) ||
        msg.author.name.toLowerCase().includes(query.toLowerCase())
      );
      results.push(...filteredMessages);
    }
    
    return results;
  }

  // Encryption API
  async encryptMessage(message: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return btoa(message); // Mock encryption
  }

  async decryptMessage(encryptedMessage: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return atob(encryptedMessage); // Mock decryption
  }
}

export const chatAPI = new ChatAPI();
