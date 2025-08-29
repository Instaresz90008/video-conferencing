
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { EmailSidebar } from '@/components/email/EmailSidebar';
import { EmailList } from '@/components/email/EmailList';
import { EmailViewer } from '@/components/email/EmailViewer';
import { EmailComposer } from '@/components/email/EmailComposer';
import { AISummaryDialog } from '@/components/email/AISummaryDialog';
import { QuickMeetingButtons } from '@/components/chat/QuickMeetingButtons';
import { emailService, type Email, type ComposeEmailData } from '@/services/emailService';
import { useOfflineCapability } from '@/hooks/useOfflineCapability';

const EmailPage = () => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isReplyingAll, setIsReplyingAll] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const [replyEmail, setReplyEmail] = useState<Email | null>(null);
  const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);
  const [summaryEmail, setSummaryEmail] = useState<Email | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);

  const { isOnline, addToOfflineQueue } = useOfflineCapability();

  useEffect(() => {
    // Load emails from service
    setEmails(emailService.getEmails());
    const inboxEmails = emailService.getEmails('inbox');
    if (inboxEmails.length > 0) {
      setSelectedEmail(inboxEmails[0]);
    }
  }, []);

  const handleSendEmail = async (emailData: ComposeEmailData) => {
    try {
      const newEmail = await emailService.sendEmail(emailData);
      
      if (isOnline) {
        setEmails(emailService.getEmails());
      } else {
        addToOfflineQueue({ type: 'sendEmail', data: newEmail });
      }
      
      toast({
        title: "Email Sent",
        description: isOnline ? "Your email has been sent successfully" : "Email queued for sending when online",
      });
      
      setIsComposing(false);
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReply = async (email: Email) => {
    setReplyEmail(email);
    setIsReplying(true);
  };

  const handleReplyAll = async (email: Email) => {
    setReplyEmail(email);
    setIsReplyingAll(true);
  };

  const handleForward = async (email: Email) => {
    setReplyEmail(email);
    setIsForwarding(true);
  };

  const handleSendReply = async (emailData: Omit<ComposeEmailData, 'to' | 'subject'>) => {
    if (!replyEmail) return;
    
    try {
      if (isReplying) {
        await emailService.replyToEmail(replyEmail, emailData);
      } else if (isReplyingAll) {
        await emailService.replyAllToEmail(replyEmail, emailData);
      }
      
      setEmails(emailService.getEmails());
      toast({
        title: "Reply Sent",
        description: "Your reply has been sent successfully",
      });
      
      setIsReplying(false);
      setIsReplyingAll(false);
      setReplyEmail(null);
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendForward = async (emailData: ComposeEmailData) => {
    if (!replyEmail) return;
    
    try {
      await emailService.forwardEmail(replyEmail, emailData);
      
      setEmails(emailService.getEmails());
      toast({
        title: "Email Forwarded",
        description: "Email has been forwarded successfully",
      });
      
      setIsForwarding(false);
      setReplyEmail(null);
    } catch (error) {
      toast({
        title: "Forward Failed",
        description: "Failed to forward email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmailAction = async (action: string, email: Email) => {
    switch (action) {
      case 'reply':
        handleReply(email);
        break;
      case 'replyAll':
        handleReplyAll(email);
        break;
      case 'forward':
        handleForward(email);
        break;
      case 'star':
        await emailService.updateEmail(email.id, { isStarred: !email.isStarred });
        setEmails(emailService.getEmails());
        break;
      case 'flag':
        await emailService.updateEmail(email.id, { isFlagged: !email.isFlagged });
        setEmails(emailService.getEmails());
        break;
      case 'archive':
        await emailService.updateEmail(email.id, { folder: 'archive' });
        setEmails(emailService.getEmails());
        toast({
          title: "Email Archived",
          description: "Email moved to archive",
        });
        break;
      case 'delete':
        await emailService.deleteEmail(email.id);
        setEmails(emailService.getEmails());
        if (selectedEmail?.id === email.id) {
          setSelectedEmail(null);
        }
        toast({
          title: "Email Deleted",
          description: "Email moved to trash",
        });
        break;
      case 'aiSummary':
        setSummaryEmail(email);
        setIsAISummaryOpen(true);
        break;
    }
  };

  return (
    <div className="container mx-auto p-6 h-screen max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Email</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered email management with unified communications
            {!isOnline && <span className="ml-2 text-orange-500">(Offline Mode)</span>}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <QuickMeetingButtons />
          
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          
          <Button onClick={() => setIsComposing(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Compose
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Sidebar */}
        <div className="col-span-3">
          <EmailSidebar 
            selectedFolder={selectedFolder}
            onFolderChange={setSelectedFolder}
          />
        </div>

        {/* Email List */}
        <div className="col-span-4">
          <EmailList 
            emails={emails}
            selectedEmail={selectedEmail}
            selectedFolder={selectedFolder}
            searchQuery={searchQuery}
            onEmailSelect={setSelectedEmail}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Email Content */}
        <div className="col-span-5">
          <EmailViewer 
            email={selectedEmail}
            onEmailAction={handleEmailAction}
          />
        </div>
      </div>

      {/* Email Composer */}
      <EmailComposer 
        isOpen={isComposing}
        onClose={() => setIsComposing(false)}
        onSend={handleSendEmail}
      />

      {/* Reply/Forward Composers */}
      {replyEmail && (isReplying || isReplyingAll) && (
        <EmailComposer 
          isOpen={true}
          onClose={() => {
            setIsReplying(false);
            setIsReplyingAll(false);
            setReplyEmail(null);
          }}
          onSend={(data) => handleSendReply(data)}
          replyTo={replyEmail}
          isReplyAll={isReplyingAll}
        />
      )}

      {replyEmail && isForwarding && (
        <EmailComposer 
          isOpen={true}
          onClose={() => {
            setIsForwarding(false);
            setReplyEmail(null);
          }}
          onSend={handleSendForward}
          forwardFrom={replyEmail}
        />
      )}

      {/* AI Summary Dialog */}
      <AISummaryDialog 
        email={summaryEmail}
        isOpen={isAISummaryOpen}
        onClose={() => {
          setIsAISummaryOpen(false);
          setSummaryEmail(null);
        }}
      />
    </div>
  );
};

export default EmailPage;
