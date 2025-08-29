
// LOCAL FALLBACK - DELETE THIS FOLDER WHEN BACKEND IS READY
import { ChatMessage } from '@/types/chat';

class LocalChatFallback {
  private messages: Map<string, ChatMessage[]> = new Map();
  private messageId = 1;

  async sendMessage(channelId: string, content: string, author: any): Promise<ChatMessage> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const message: ChatMessage = {
      id: `msg_${this.messageId++}`,
      content,
      author,
      timestamp: new Date().toISOString(),
      channelId,
      type: 'text',
      deliveryStatus: 'sent',
      reactions: [],
      mentions: [],
      isEncrypted: false
    };

    if (!this.messages.has(channelId)) {
      this.messages.set(channelId, []);
    }
    
    this.messages.get(channelId)!.push(message);
    return message;
  }

  async getMessages(channelId: string): Promise<ChatMessage[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.messages.get(channelId) || [];
  }

  subscribe(channelId: string, callback: (message: ChatMessage) => void) {
    // Mock subscription - in real app this would be WebSocket
    console.log(`Subscribed to local channel: ${channelId}`);
  }

  unsubscribe(channelId: string) {
    console.log(`Unsubscribed from local channel: ${channelId}`);
  }
}

export const localChatFallback = new LocalChatFallback();
