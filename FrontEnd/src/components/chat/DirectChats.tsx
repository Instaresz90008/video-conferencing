
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Plus, 
  MessageCircle, 
  Phone, 
  Video, 
  MoreHorizontal,
  Users,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DirectChat {
  id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar?: string;
  type: 'individual' | 'group';
  participants?: number;
}

interface DirectChatsProps {
  selectedChat: string;
  onChatSelect: (chatId: string) => void;
}

const DirectChats: React.FC<DirectChatsProps> = ({ selectedChat, onChatSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const directChats: DirectChat[] = [
    {
      id: 'chat-1',
      name: 'Sarah Johnson',
      status: 'online',
      lastMessage: 'Let\'s discuss the project timeline',
      lastMessageTime: '2 min ago',
      unreadCount: 3,
      type: 'individual'
    },
    {
      id: 'chat-2',
      name: 'Development Team',
      status: 'online',
      lastMessage: 'New deployment is ready',
      lastMessageTime: '5 min ago',
      unreadCount: 1,
      type: 'group',
      participants: 8
    },
    {
      id: 'chat-3',
      name: 'Michael Chen',
      status: 'away',
      lastMessage: 'Thanks for the update',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      type: 'individual'
    },
    {
      id: 'chat-4',
      name: 'Marketing Team',
      status: 'online',
      lastMessage: 'Campaign results are in',
      lastMessageTime: '2 hours ago',
      unreadCount: 5,
      type: 'group',
      participants: 12
    },
    {
      id: 'chat-5',
      name: 'Emma Wilson',
      status: 'offline',
      lastMessage: 'See you tomorrow',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      type: 'individual'
    }
  ];

  const filteredChats = directChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="h-full dark:bg-gray-800/50 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Direct Chats
          </CardTitle>
          <Button size="sm" variant="ghost" className="dark:hover:bg-gray-700">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-3">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  "hover:bg-gray-100 dark:hover:bg-gray-700/50",
                  selectedChat === chat.id && "bg-blue-100 dark:bg-blue-900/20"
                )}
              >
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="dark:bg-gray-600 dark:text-white">
                      {chat.type === 'group' ? (
                        <Users className="w-5 h-5" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800",
                    getStatusColor(chat.status)
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium truncate dark:text-white">
                      {chat.name}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {chat.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {chat.type === 'group' && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {chat.participants} participants
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                    <Phone className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                    <Video className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DirectChats;
