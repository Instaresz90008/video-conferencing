
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Star, 
  Reply, 
  ReplyAll, 
  Forward, 
  Paperclip, 
  Flag,
  Archive,
  Trash2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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

interface EmailViewerProps {
  email: Email | null;
  onEmailAction: (action: string, email: Email) => void;
}

export const EmailViewer: React.FC<EmailViewerProps> = ({
  email,
  onEmailAction
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

  const handleAISummarize = () => {
    // AI integration hook for email summarization
    toast({
      title: "AI Summary",
      description: "Email summarization will be available soon",
    });
  };

  if (!email) {
    return (
      <Card className="h-full dark:bg-gray-800/50 dark:border-gray-700">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <Mail className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select an Email</h3>
            <p className="text-muted-foreground">
              Choose an email from the list to view its content
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full dark:bg-gray-800/50 dark:border-gray-700">
      <div className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">{email.subject}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {email.from.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span>{email.from}</span>
                <span>&lt;{email.fromEmail}&gt;</span>
                <span>•</span>
                <span>{formatTime(email.timestamp)}</span>
              </div>
              {email.to.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  To: {email.to.join(', ')}
                </div>
              )}
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEmailAction('star', email)}
              >
                <Star className={cn(
                  "w-4 h-4",
                  email.isStarred ? "text-yellow-500 fill-current" : ""
                )} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEmailAction('flag', email)}
              >
                <Flag className={cn(
                  "w-4 h-4",
                  email.isFlagged ? "text-red-500" : ""
                )} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAISummarize}
              >
                <Sparkles className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEmailAction('archive', email)}
              >
                <Archive className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEmailAction('delete', email)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="flex-1 p-6">
          <ScrollArea className="h-full">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap">{email.body}</div>
            </div>
            
            {email.attachments && email.attachments.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Attachments</h4>
                <div className="space-y-2">
                  {email.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <Paperclip className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{attachment.name}</div>
                        <div className="text-xs text-muted-foreground">{attachment.size}</div>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        
        <Separator />
        
        <div className="p-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </Button>
            <Button variant="outline" size="sm">
              <ReplyAll className="w-4 h-4 mr-2" />
              Reply All
            </Button>
            <Button variant="outline" size="sm">
              <Forward className="w-4 h-4 mr-2" />
              Forward
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
