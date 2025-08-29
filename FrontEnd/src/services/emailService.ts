
export interface EmailAttachment {
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface Email {
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
  attachments?: EmailAttachment[];
  folder: 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash' | 'archive';
  priority: 'high' | 'normal' | 'low';
  threadId?: string;
  parentId?: string;
}

export interface ComposeEmailData {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  attachments?: File[];
}

class EmailService {
  private emails: Email[] = [];
  private mockUser = { name: 'You', email: 'you@company.com' };

  constructor() {
    this.initializeMockEmails();
  }

  private initializeMockEmails() {
    this.emails = [
      {
        id: '1',
        from: 'Sarah Johnson',
        fromEmail: 'sarah@company.com',
        to: ['you@company.com'],
        subject: 'Project Update - Q4 Roadmap',
        body: 'Hi there,\n\nI wanted to give you an update on our Q4 roadmap. We\'ve made significant progress on the key milestones and are on track to deliver all planned features.\n\nKey achievements:\n- User authentication system completed\n- Database optimization finished\n- UI/UX improvements implemented\n\nNext steps:\n- Begin testing phase\n- Prepare for beta release\n- Gather user feedback\n\nLet me know if you have any questions or concerns.\n\nBest regards,\nSarah',
        timestamp: '2024-01-15T10:30:00Z',
        isRead: false,
        isStarred: true,
        isFlagged: false,
        folder: 'inbox',
        priority: 'high',
        attachments: [
          { name: 'roadmap.pdf', size: '2.3 MB', type: 'pdf' }
        ]
      },
      {
        id: '2',
        from: 'Marketing Team',
        fromEmail: 'marketing@company.com',
        to: ['you@company.com'],
        cc: ['team@company.com'],
        subject: 'New Campaign Performance Report',
        body: 'Hello,\n\nPlease find attached the performance report for our latest marketing campaign. The results have exceeded our expectations with a 25% increase in engagement.\n\nHighlights:\n- 50,000 new leads generated\n- 25% increase in conversion rate\n- 40% improvement in email open rates\n\nWe should discuss the next steps in our weekly meeting.\n\nThanks,\nMarketing Team',
        timestamp: '2024-01-15T09:15:00Z',
        isRead: true,
        isStarred: false,
        isFlagged: true,
        folder: 'inbox',
        priority: 'normal',
        attachments: [
          { name: 'campaign-report.xlsx', size: '1.8 MB', type: 'excel' }
        ]
      },
      {
        id: '3',
        from: 'Michael Chen',
        fromEmail: 'michael@partner.com',
        to: ['you@company.com'],
        subject: 'Meeting Confirmation - Tomorrow 2 PM',
        body: 'Hi,\n\nJust confirming our meeting tomorrow at 2 PM to discuss the partnership proposal. I\'ll send the Zoom link shortly.\n\nAgenda:\n- Partnership terms review\n- Revenue sharing model\n- Implementation timeline\n- Next steps\n\nLooking forward to our discussion.\n\nBest,\nMichael',
        timestamp: '2024-01-15T08:45:00Z',
        isRead: true,
        isStarred: false,
        isFlagged: false,
        folder: 'inbox',
        priority: 'high'
      },
      {
        id: '4',
        from: 'Newsletter',
        fromEmail: 'newsletter@techblog.com',
        to: ['you@company.com'],
        subject: 'Weekly Tech Digest - AI & Machine Learning',
        body: 'This week in technology:\n\n1. OpenAI releases new GPT model\n2. Google announces breakthrough in quantum computing\n3. Apple unveils new privacy features\n4. Microsoft expands Azure AI services\n\nRead more at techblog.com',
        timestamp: '2024-01-15T07:00:00Z',
        isRead: false,
        isStarred: false,
        isFlagged: false,
        folder: 'inbox',
        priority: 'low'
      }
    ];
  }

  async sendEmail(data: ComposeEmailData): Promise<Email> {
    const newEmail: Email = {
      id: Date.now().toString(),
      from: this.mockUser.name,
      fromEmail: this.mockUser.email,
      to: [data.to],
      cc: data.cc ? [data.cc] : undefined,
      bcc: data.bcc ? [data.bcc] : undefined,
      subject: data.subject,
      body: data.body,
      timestamp: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      isFlagged: false,
      folder: 'sent',
      priority: 'normal',
      attachments: data.attachments ? data.attachments.map(file => ({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.type
      })) : undefined
    };

    this.emails.push(newEmail);
    return newEmail;
  }

  async replyToEmail(originalEmail: Email, replyData: Omit<ComposeEmailData, 'to' | 'subject'>): Promise<Email> {
    const reply: Email = {
      id: Date.now().toString(),
      from: this.mockUser.name,
      fromEmail: this.mockUser.email,
      to: [originalEmail.fromEmail],
      cc: replyData.cc ? [replyData.cc] : undefined,
      bcc: replyData.bcc ? [replyData.bcc] : undefined,
      subject: originalEmail.subject.startsWith('Re: ') ? originalEmail.subject : `Re: ${originalEmail.subject}`,
      body: replyData.body,
      timestamp: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      isFlagged: false,
      folder: 'sent',
      priority: 'normal',
      threadId: originalEmail.threadId || originalEmail.id,
      parentId: originalEmail.id
    };

    this.emails.push(reply);
    return reply;
  }

  async replyAllToEmail(originalEmail: Email, replyData: Omit<ComposeEmailData, 'to' | 'subject'>): Promise<Email> {
    const allRecipients = [originalEmail.fromEmail, ...originalEmail.to, ...(originalEmail.cc || [])];
    const filteredRecipients = allRecipients.filter(email => email !== this.mockUser.email);

    const reply: Email = {
      id: Date.now().toString(),
      from: this.mockUser.name,
      fromEmail: this.mockUser.email,
      to: filteredRecipients,
      cc: replyData.cc ? [replyData.cc] : undefined,
      bcc: replyData.bcc ? [replyData.bcc] : undefined,
      subject: originalEmail.subject.startsWith('Re: ') ? originalEmail.subject : `Re: ${originalEmail.subject}`,
      body: replyData.body,
      timestamp: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      isFlagged: false,
      folder: 'sent',
      priority: 'normal',
      threadId: originalEmail.threadId || originalEmail.id,
      parentId: originalEmail.id
    };

    this.emails.push(reply);
    return reply;
  }

  async forwardEmail(originalEmail: Email, forwardData: ComposeEmailData): Promise<Email> {
    const forwarded: Email = {
      id: Date.now().toString(),
      from: this.mockUser.name,
      fromEmail: this.mockUser.email,
      to: [forwardData.to],
      cc: forwardData.cc ? [forwardData.cc] : undefined,
      bcc: forwardData.bcc ? [forwardData.bcc] : undefined,
      subject: originalEmail.subject.startsWith('Fwd: ') ? originalEmail.subject : `Fwd: ${originalEmail.subject}`,
      body: `${forwardData.body}\n\n---------- Forwarded message ---------\nFrom: ${originalEmail.from} <${originalEmail.fromEmail}>\nDate: ${originalEmail.timestamp}\nSubject: ${originalEmail.subject}\nTo: ${originalEmail.to.join(', ')}\n\n${originalEmail.body}`,
      timestamp: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      isFlagged: false,
      folder: 'sent',
      priority: 'normal'
    };

    this.emails.push(forwarded);
    return forwarded;
  }

  async saveDraft(data: ComposeEmailData): Promise<Email> {
    const draft: Email = {
      id: Date.now().toString(),
      from: this.mockUser.name,
      fromEmail: this.mockUser.email,
      to: data.to ? [data.to] : [],
      cc: data.cc ? [data.cc] : undefined,
      bcc: data.bcc ? [data.bcc] : undefined,
      subject: data.subject || '(No Subject)',
      body: data.body,
      timestamp: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      isFlagged: false,
      folder: 'drafts',
      priority: 'normal'
    };

    this.emails.push(draft);
    return draft;
  }

  async updateEmail(emailId: string, updates: Partial<Email>): Promise<Email | null> {
    const emailIndex = this.emails.findIndex(email => email.id === emailId);
    if (emailIndex === -1) return null;

    this.emails[emailIndex] = { ...this.emails[emailIndex], ...updates };
    return this.emails[emailIndex];
  }

  async deleteEmail(emailId: string): Promise<boolean> {
    const email = this.emails.find(e => e.id === emailId);
    if (!email) return false;

    if (email.folder === 'trash') {
      // Permanently delete
      this.emails = this.emails.filter(e => e.id !== emailId);
    } else {
      // Move to trash
      await this.updateEmail(emailId, { folder: 'trash' });
    }
    return true;
  }

  getEmails(folder?: string): Email[] {
    if (folder) {
      return this.emails.filter(email => email.folder === folder);
    }
    return this.emails;
  }

  getEmail(emailId: string): Email | null {
    return this.emails.find(email => email.id === emailId) || null;
  }

  async generateAISummary(email: Email): Promise<string> {
    // Mock AI summary - in real implementation, this would call an AI service
    const wordCount = email.body.split(' ').length;
    const keyPoints = email.body.split('\n').filter(line => line.trim().startsWith('-')).slice(0, 3);
    
    let summary = `📧 Email Summary (${wordCount} words):\n\n`;
    
    if (keyPoints.length > 0) {
      summary += `Key Points:\n${keyPoints.join('\n')}\n\n`;
    }
    
    summary += `💭 AI Analysis:\n`;
    summary += `• Sender: ${email.from} (${email.fromEmail})\n`;
    summary += `• Priority: ${email.priority.toUpperCase()}\n`;
    summary += `• Sentiment: ${this.analyzeSentiment(email.body)}\n`;
    summary += `• Action Required: ${this.suggestAction(email.body)}\n`;
    summary += `• Estimated Reading Time: ${Math.ceil(wordCount / 200)} minute(s)`;
    
    return summary;
  }

  private analyzeSentiment(text: string): string {
    const positiveWords = ['great', 'excellent', 'good', 'success', 'achieve', 'progress'];
    const negativeWords = ['urgent', 'problem', 'issue', 'concern', 'fail', 'delay'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'Positive';
    if (negativeCount > positiveCount) return 'Negative';
    return 'Neutral';
  }

  private suggestAction(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('meeting') || lowerText.includes('schedule')) return 'Schedule Meeting';
    if (lowerText.includes('urgent') || lowerText.includes('asap')) return 'Immediate Response Required';
    if (lowerText.includes('review') || lowerText.includes('feedback')) return 'Review and Respond';
    if (lowerText.includes('fyi') || lowerText.includes('information')) return 'For Information Only';
    
    return 'Standard Response';
  }
}

export const emailService = new EmailService();
