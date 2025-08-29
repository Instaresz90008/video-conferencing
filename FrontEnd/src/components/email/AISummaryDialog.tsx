
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Copy, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { emailService } from '@/services/emailService';

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

interface AISummaryDialogProps {
  email: Email | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AISummaryDialog: React.FC<AISummaryDialogProps> = ({
  email,
  isOpen,
  onClose
}) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && email) {
      generateSummary();
    }
  }, [isOpen, email]);

  const generateSummary = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiSummary = await emailService.generateAISummary(email);
      setSummary(aiSummary);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI summary",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast({
        title: "Copied!",
        description: "AI summary copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy summary",
        variant: "destructive",
      });
    }
  };

  const regenerateSummary = () => {
    setSummary('');
    generateSummary();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-white">
            <Sparkles className="w-5 h-5" />
            AI Email Summary
          </DialogTitle>
        </DialogHeader>
        
        {email && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
              <div className="text-sm font-medium">{email.subject}</div>
              <div className="text-xs text-muted-foreground">
                From: {email.from} ({email.fromEmail})
              </div>
            </div>

            <ScrollArea className="h-[400px] w-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 mx-auto mb-4 animate-pulse" />
                    <div className="text-sm text-muted-foreground">
                      AI is analyzing your email...
                    </div>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap text-sm">{summary}</pre>
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={regenerateSummary}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copySummary}
                  disabled={isLoading || !summary}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
