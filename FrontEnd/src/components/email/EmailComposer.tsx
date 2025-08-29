
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, Paperclip, Calendar, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: {
    to: string;
    cc: string;
    bcc: string;
    subject: string;
    body: string;
  }) => void;
  replyTo?: {
    id: string;
    from: string;
    to: string[];
    cc?: string[];
    subject: string;
    body: string;
  };
  isReplyAll?: boolean;
  forwardFrom?: {
    id: string;
    from: string;
    to: string[];
    cc?: string[];
    subject: string;
    body: string;
  };
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  isOpen,
  onClose,
  onSend,
  replyTo,
  isReplyAll,
  forwardFrom
}) => {
  const [composeEmail, setComposeEmail] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });

  // Reset form when dialog opens/closes or when reply/forward props change
  useEffect(() => {
    if (isOpen) {
      if (replyTo) {
        // Handle reply or reply all
        const recipients = isReplyAll 
          ? [replyTo.from, ...replyTo.to.filter(email => email !== replyTo.from)]
          : [replyTo.from];
        
        setComposeEmail({
          to: recipients.join(', '),
          cc: isReplyAll && replyTo.cc ? replyTo.cc.join(', ') : '',
          bcc: '',
          subject: replyTo.subject.startsWith('Re: ') ? replyTo.subject : `Re: ${replyTo.subject}`,
          body: `\n\n--- Original Message ---\nFrom: ${replyTo.from}\nTo: ${replyTo.to.join(', ')}\nSubject: ${replyTo.subject}\n\n${replyTo.body}`
        });
      } else if (forwardFrom) {
        // Handle forward
        setComposeEmail({
          to: '',
          cc: '',
          bcc: '',
          subject: forwardFrom.subject.startsWith('Fwd: ') ? forwardFrom.subject : `Fwd: ${forwardFrom.subject}`,
          body: `\n\n--- Forwarded Message ---\nFrom: ${forwardFrom.from}\nTo: ${forwardFrom.to.join(', ')}\nSubject: ${forwardFrom.subject}\n\n${forwardFrom.body}`
        });
      } else {
        // New email
        setComposeEmail({ to: '', cc: '', bcc: '', subject: '', body: '' });
      }
    }
  }, [isOpen, replyTo, isReplyAll, forwardFrom]);

  const handleSend = () => {
    if (!composeEmail.to || !composeEmail.subject) {
      toast({
        title: "Missing Information",
        description: "Please fill in recipient and subject",
        variant: "destructive",
      });
      return;
    }

    onSend(composeEmail);
    setComposeEmail({ to: '', cc: '', bcc: '', subject: '', body: '' });
    onClose();
  };

  const handleAIAssist = () => {
    // AI integration hook - can be connected to various AI services
    toast({
      title: "AI Assistant",
      description: "AI writing assistance will be available soon",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Compose Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Input
              placeholder="To"
              value={composeEmail.to}
              onChange={(e) => setComposeEmail(prev => ({ ...prev, to: e.target.value }))}
              className="dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="CC (optional)"
                value={composeEmail.cc}
                onChange={(e) => setComposeEmail(prev => ({ ...prev, cc: e.target.value }))}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
              <Input
                placeholder="BCC (optional)"
                value={composeEmail.bcc}
                onChange={(e) => setComposeEmail(prev => ({ ...prev, bcc: e.target.value }))}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <Input
              placeholder="Subject"
              value={composeEmail.subject}
              onChange={(e) => setComposeEmail(prev => ({ ...prev, subject: e.target.value }))}
              className="dark:bg-gray-700 dark:border-gray-600"
            />
            <Textarea
              placeholder="Write your message..."
              value={composeEmail.body}
              onChange={(e) => setComposeEmail(prev => ({ ...prev, body: e.target.value }))}
              className="min-h-[200px] dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Paperclip className="w-4 h-4 mr-2" />
                Attach
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button variant="outline" size="sm" onClick={handleAIAssist}>
                <Sparkles className="w-4 h-4 mr-2" />
                AI Assist
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSend}>
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
