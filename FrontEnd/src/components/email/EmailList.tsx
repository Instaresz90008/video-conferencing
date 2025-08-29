
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, MoreHorizontal, Star, Flag, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  isFlagged: boolean;
  attachments?: Array<{
    name: string;
    size: string;
    type: string;
  }>;
  folder: 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash' | 'archive';
  priority: 'high' | 'normal' | 'low';
}

interface EmailListProps {
  emails: Email[];
  selectedEmail: Email | null;
  selectedFolder: string;
  searchQuery: string;
  onEmailSelect: (email: Email) => void;
  onSearchChange: (query: string) => void;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmail,
  selectedFolder,
  searchQuery,
  onEmailSelect,
  onSearchChange
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesFolder = email.folder === selectedFolder;
    const matchesSearch = !searchQuery || 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFolder && matchesSearch;
  });

  return (
    <Card className="h-full dark:bg-gray-800/50 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg capitalize">{selectedFolder}</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="space-y-1 p-3">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => onEmailSelect(email)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border-l-4",
                  "hover:bg-gray-100 dark:hover:bg-gray-700/50",
                  selectedEmail?.id === email.id && "bg-blue-100 dark:bg-blue-900/20",
                  !email.isRead && "border-l-blue-500 bg-blue-50 dark:bg-blue-900/10",
                  email.isRead && "border-l-transparent"
                )}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="text-xs dark:bg-gray-600 dark:text-white">
                    {email.from.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-sm truncate",
                      !email.isRead ? "font-semibold" : "font-medium"
                    )}>
                      {email.from}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(email.timestamp)}
                      </span>
                      {email.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                      {email.isFlagged && <Flag className="w-3 h-3 text-red-500" />}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "text-sm truncate mb-1",
                    !email.isRead ? "font-medium" : "font-normal"
                  )}>
                    {email.subject}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate">
                      {email.body.substring(0, 60)}...
                    </p>
                    
                    <div className="flex items-center gap-1">
                      {email.attachments && (
                        <Paperclip className="w-3 h-3 text-muted-foreground" />
                      )}
                      <div className={cn("w-2 h-2 rounded-full", getPriorityColor(email.priority))} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
