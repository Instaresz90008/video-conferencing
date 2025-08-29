
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  Star, 
  Flag, 
  Archive, 
  Trash2, 
  Sparkles,
  Download
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

interface EmailActionsProps {
  email: Email;
  onReply: (email: Email) => void;
  onReplyAll: (email: Email) => void;
  onForward: (email: Email) => void;
  onStar: (email: Email) => void;
  onFlag: (email: Email) => void;
  onArchive: (email: Email) => void;
  onDelete: (email: Email) => void;
  onAISummary: (email: Email) => void;
}

export const EmailActions: React.FC<EmailActionsProps> = ({
  email,
  onReply,
  onReplyAll,
  onForward,
  onStar,
  onFlag,
  onArchive,
  onDelete,
  onAISummary
}) => {
  const handleDownloadAttachment = (attachment: any) => {
    toast({
      title: "Download Started",
      description: `Downloading ${attachment.name}`,
    });
    // In a real app, this would trigger the actual download
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onReply(email)}>
          <Reply className="w-4 h-4 mr-2" />
          Reply
        </Button>
        <Button variant="outline" size="sm" onClick={() => onReplyAll(email)}>
          <ReplyAll className="w-4 h-4 mr-2" />
          Reply All
        </Button>
        <Button variant="outline" size="sm" onClick={() => onForward(email)}>
          <Forward className="w-4 h-4 mr-2" />
          Forward
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStar(email)}
        >
          <Star className={cn(
            "w-4 h-4",
            email.isStarred ? "text-yellow-500 fill-current" : ""
          )} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFlag(email)}
        >
          <Flag className={cn(
            "w-4 h-4",
            email.isFlagged ? "text-red-500" : ""
          )} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAISummary(email)}
        >
          <Sparkles className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onArchive(email)}
        >
          <Archive className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(email)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Attachments</h4>
          <div className="space-y-2">
            {email.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                <div className="flex-1">
                  <div className="text-sm font-medium">{attachment.name}</div>
                  <div className="text-xs text-muted-foreground">{attachment.size}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadAttachment(attachment)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
