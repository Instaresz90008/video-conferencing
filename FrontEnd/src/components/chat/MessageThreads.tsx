
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, MoreVertical, Pin, Reply } from 'lucide-react';
import { ChatMessage, MessageThread } from '@/types/chat';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MessageThreadsProps {
  message: ChatMessage;
  onReply: (parentId: string, content: string) => void;
  onPin: (messageId: string) => void;
}

const MessageThreads: React.FC<MessageThreadsProps> = ({
  message,
  onReply,
  onPin
}) => {
  const [showThread, setShowThread] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<ChatMessage[]>([]);

  // Mock thread replies
  const mockReplies: ChatMessage[] = [
    {
      id: 'reply1',
      content: 'Great point! I agree with this approach.',
      author: {
        id: 'user2',
        name: 'Alice Johnson',
        status: 'online'
      },
      channelId: message.channelId,
      timestamp: new Date(Date.now() - 30000).toISOString(),
      type: 'text',
      reactions: [],
      mentions: [],
      isEncrypted: false,
      deliveryStatus: 'read'
    },
    {
      id: 'reply2',
      content: 'Let me add some additional context here...',
      author: {
        id: 'user3',
        name: 'Bob Wilson',
        status: 'online'
      },
      channelId: message.channelId,
      timestamp: new Date(Date.now() - 15000).toISOString(),
      type: 'text',
      reactions: [],
      mentions: [],
      isEncrypted: false,
      deliveryStatus: 'read'
    }
  ];

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    const newReply: ChatMessage = {
      id: `reply-${Date.now()}`,
      content: replyText,
      author: {
        id: 'current-user',
        name: 'You',
        status: 'online'
      },
      channelId: message.channelId,
      timestamp: new Date().toISOString(),
      type: 'text',
      reactions: [],
      mentions: [],
      isEncrypted: false,
      deliveryStatus: 'sent',
      replyTo: message.id
    };

    setReplies([...replies, newReply]);
    onReply(message.id, replyText);
    setReplyText('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const allReplies = replies.length > 0 ? replies : mockReplies;
  const replyCount = allReplies.length;

  return (
    <div className="mt-2">
      {/* Thread Toggle */}
      {replyCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowThread(!showThread)}
          className="text-brand-blue hover:bg-brand-blue/10 p-1 h-auto"
        >
          <MessageSquare className="w-3 h-3 mr-1" />
          <span className="text-xs">
            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
          </span>
        </Button>
      )}

      {/* Reply Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowThread(true)}
        className="text-muted-foreground hover:text-foreground p-1 h-auto ml-2"
      >
        <Reply className="w-3 h-3 mr-1" />
        <span className="text-xs">Reply</span>
      </Button>

      {/* Thread View */}
      {showThread && (
        <div className="mt-3 ml-4 border-l-2 border-muted pl-4">
          <div className="space-y-3">
            {/* Thread Replies */}
            <ScrollArea className="max-h-64">
              {allReplies.map((reply) => (
                <div key={reply.id} className="flex gap-2 mb-3">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {reply.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {reply.author.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(reply.timestamp)}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          reply.author.status === 'online' ? 'bg-green-500' :
                          reply.author.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-2">
                      <p className="text-sm">{reply.content}</p>
                    </div>

                    {/* Reply Actions */}
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        👍 React
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onPin(reply.id)}>
                            <Pin className="w-4 h-4 mr-2" />
                            Pin Reply
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>

            {/* Reply Input */}
            <div className="flex gap-2 pt-2 border-t">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs">You</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Reply to thread..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageThreads;
