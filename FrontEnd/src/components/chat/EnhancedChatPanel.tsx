import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { 
  MessageCircle, Send, Smile, X, BarChart2, Check, 
  Code, Paperclip, Search, Hash, AtSign, Maximize2, Minimize2
} from "lucide-react";
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from "@/hooks/use-toast";
import AttachmentUpload from './AttachmentUpload';
import CodeBlock from './CodeBlock';
import CodePasteDialog from './CodePasteDialog';
import { QuickMeetingButtons } from './QuickMeetingButtons';

interface EnhancedChatPanelProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  onSendMessage: (text: string, type?: 'text' | 'code' | 'attachment', extra?: any) => void;
  unreadCount: number;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  file: File;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: Date;
  isLocal: boolean;
  recipientId?: string | null;
  isPoll?: boolean;
  pollOptions?: string[];
  pollResults?: Record<string, number>;
  pollId?: string;
  isCode?: boolean;
  codeLanguage?: string;
  attachments?: Attachment[];
  mentions?: string[];
  channels?: string[];
}

interface PollOption {
  id: string;
  text: string;
}

// Generate 20 mock participants
const generateMockParticipants = () => {
  const firstNames = ["Emma", "Michael", "Sophia", "James", "Olivia", "William", "Ava", "Benjamin", 
    "Charlotte", "Daniel", "Mia", "Ethan", "Harper", "Alexander", "Abigail", "David", "Emily", "Joseph", "Madison", "Samuel"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", 
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
  
  return Array(20).fill(null).map((_, index) => ({
    id: (index + 2).toString(), // Start from id 2 since "You" is id 1
    name: `${firstNames[index % firstNames.length]} ${lastNames[index % lastNames.length]}`,
    isLocal: false
  }));
};

// Mock initial messages
const INITIAL_MESSAGES: Message[] = [
  { id: 1, sender: "Emma Johnson", content: "Hi everyone! Excited for today's meeting.", timestamp: new Date(Date.now() - 1000 * 60 * 5), isLocal: false },
  { id: 2, sender: "Michael Chen", content: "Me too! I've prepared the slides.", timestamp: new Date(Date.now() - 1000 * 60 * 4), isLocal: false },
  { id: 3, sender: "You", content: "Great! Should we start with the project update?", timestamp: new Date(Date.now() - 1000 * 60 * 3), isLocal: true },
];

const QUICK_EMOJIS = ["👍", "👏", "❤️", "🔥", "😂", "🎉", "👋", "🤔", "✅"];

const EnhancedChatPanel: React.FC<EnhancedChatPanelProps> = ({ 
  className,
  isOpen,
  onClose,
  isFullScreen = false,
  onToggleFullScreen,
  onSendMessage,
  unreadCount
}) => {
  const { participants } = useAppSelector(state => state.meeting);
  const { messages } = useAppSelector(state => state.chat);
  
  const [localMessages, setLocalMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: "1", text: "Yes" },
    { id: "2", text: "No" }
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock participants (20 people)
  const mockParticipants = useRef(generateMockParticipants());
  
  // Combined participants list (real + mock)
  const allParticipants = [
    { id: "1", name: "You", isLocal: true },
    ...mockParticipants.current
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "" && attachments.length === 0) return;
    
    const localParticipant = participants.find(p => p.isLocal);
    
    // Parse mentions and channels
    const mentions = newMessage.match(/@\w+/g)?.map(m => m.slice(1)) || [];
    const channels = newMessage.match(/#\w+/g)?.map(c => c.slice(1)) || [];
    
    const message: Message = {
      id: Date.now(),
      sender: localParticipant?.name || "You",
      content: newMessage,
      timestamp: new Date(),
      isLocal: true,
      recipientId: selectedRecipient,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      mentions,
      channels
    };
    
    setLocalMessages([...localMessages, message]);
    onSendMessage(newMessage);
    setNewMessage("");
    setAttachments([]);
    
    // Show toast for private messages
    if (selectedRecipient) {
      const recipient = allParticipants.find(p => p.id === selectedRecipient);
      toast({
        title: "Private message sent",
        description: `Message sent to ${recipient?.name}`,
      });
    }
    
    // Toast for confirmation
    toast({
      title: "Message sent",
      description: selectedRecipient ? "Private message sent" : "Message sent to all participants",
    });
  };

  const handleCreatePoll = () => {
    if (!pollQuestion.trim() || pollOptions.length < 2) {
      toast({
        title: "Cannot create poll",
        description: "Please provide a question and at least two options",
        variant: "destructive",
      });
      return;
    }
    
    const pollId = `poll-${Date.now()}`;
    
    const pollMessage: Message = {
      id: Date.now(),
      sender: "You",
      content: pollQuestion,
      timestamp: new Date(),
      isLocal: true,
      isPoll: true,
      pollOptions: pollOptions.map(opt => opt.text),
      pollResults: {},
      pollId
    };
    
    setLocalMessages([...localMessages, pollMessage]);
    setIsPollDialogOpen(false);
    setPollQuestion("");
    setPollOptions([
      { id: "1", text: "Yes" },
      { id: "2", text: "No" }
    ]);
    
    toast({
      title: "Poll created",
      description: "Poll has been sent to all participants",
    });
  };
  
  const handleVote = (pollId: string, optionIndex: number) => {
    setLocalMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.pollId === pollId) {
          const updatedResults = { ...(msg.pollResults || {}) };
          const optionText = msg.pollOptions![optionIndex];
          
          // Increment vote count for this option
          updatedResults[optionText] = (updatedResults[optionText] || 0) + 1;
          
          return { ...msg, pollResults: updatedResults };
        }
        return msg;
      })
    );
    
    toast({
      title: "Vote recorded",
      description: "Your vote has been counted",
    });
  };

  const handleCodeSubmit = (code: string, language: string) => {
    const localParticipant = participants.find(p => p.isLocal);
    
    const message: Message = {
      id: Date.now(),
      sender: localParticipant?.name || "You",
      content: code,
      timestamp: new Date(),
      isLocal: true,
      recipientId: selectedRecipient,
      isCode: true,
      codeLanguage: language
    };
    
    setLocalMessages([...localMessages, message]);
    
    toast({
      title: "Code shared",
      description: `${language} code snippet shared`,
    });
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const addPollOption = () => {
    setPollOptions([
      ...pollOptions,
      { id: Date.now().toString(), text: "" }
    ]);
  };
  
  const updatePollOption = (id: string, text: string) => {
    setPollOptions(
      pollOptions.map(option =>
        option.id === id ? { ...option, text } : option
      )
    );
  };
  
  const removePollOption = (id: string) => {
    if (pollOptions.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "Polls require at least two options",
        variant: "destructive",
      });
      return;
    }
    setPollOptions(pollOptions.filter(option => option.id !== id));
  };

  const filteredMessages = localMessages.filter(msg => 
    (!msg.recipientId || msg.recipientId === "1" || msg.isLocal) &&
    (searchQuery === "" || 
    msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.sender.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderMessageContent = (message: Message) => {
    if (message.isPoll) {
      return (
        <div className="bg-white/10 p-3 rounded-md">
          <p className="font-medium mb-2">{message.content}</p>
          <div className="space-y-2">
            {message.pollOptions?.map((option, index) => {
              const voteCount = message.pollResults?.[option] || 0;
              const percentage = message.pollResults && Object.values(message.pollResults).reduce((a, b) => a + b, 0) > 0
                ? Math.round((voteCount / Object.values(message.pollResults).reduce((a, b) => a + b, 0)) * 100)
                : 0;
              
              return (
                <div key={index} className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mr-2 bg-white/10"
                    onClick={() => handleVote(message.pollId!, index)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Vote
                  </Button>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>{option}</span>
                      <span>{voteCount} vote{voteCount !== 1 ? 's' : ''} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    if (message.isCode) {
      return <CodeBlock code={message.content} language={message.codeLanguage} />;
    }
    
    return (
      <div>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map(attachment => (
              <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-white/10 rounded">
                <Paperclip className="w-4 h-4" />
                <span className="text-sm">{attachment.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const chatPanelClasses = cn(
    "bg-white/10 backdrop-blur-xl border-l border-white/20 dark:bg-black/20 dark:border-white/10 flex flex-col z-20 transition-all duration-300 ease-in-out",
    isFullScreen 
      ? "fixed inset-0 z-50" 
      : "fixed inset-y-0 right-0 w-96",
    isOpen ? "translate-x-0" : "translate-x-full",
    className
  );

  return (
    <>
      <div className={chatPanelClasses}>
        {/* Header */}
        <div className="p-4 border-b border-white/20 dark:border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat
            {selectedRecipient && (
              <span className="ml-2 text-sm bg-white/20 py-0.5 px-2 rounded-full">
                Private
              </span>
            )}
          </h3>
          <div className="flex items-center space-x-2">
            {onToggleFullScreen && (
              <button 
                onClick={onToggleFullScreen}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                title={isFullScreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="p-2 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="pl-8 bg-white/10 border-white/20"
            />
          </div>
        </div>

        {/* Recipient selector */}
        <div className="p-2 border-b border-white/10">
          <select
            value={selectedRecipient || ""}
            onChange={(e) => setSelectedRecipient(e.target.value || null)}
            className="w-full bg-white/10 border border-white/20 rounded-md p-1.5 text-sm"
          >
            <option value="">Everyone</option>
            {allParticipants.filter(p => !p.isLocal).map(participant => (
              <option key={participant.id} value={participant.id}>
                {participant.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.map(message => (
            <div 
              key={message.id} 
              className={cn(
                "flex flex-col max-w-[85%] rounded-xl p-3 animate-fade-in",
                message.isLocal ? 
                  "ml-auto bg-primary text-white rounded-br-none" : 
                  "bg-white/20 dark:bg-white/10 rounded-bl-none",
                message.recipientId ? "border-l-4 border-purple-500" : ""
              )}
            >
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-medium text-sm">
                  {message.sender}
                  {message.mentions && message.mentions.length > 0 && (
                    <span className="ml-1 text-xs opacity-80">
                      mentioned @{message.mentions.join(', @')}
                    </span>
                  )}
                  {message.recipientId && (
                    <span className="ml-1 text-xs opacity-80">
                      to {message.recipientId === "1" ? "you" : allParticipants.find(p => p.id === message.recipientId)?.name}
                    </span>
                  )}
                </span>
                <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
              </div>
              {renderMessageContent(message)}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Attachment preview */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 border-t border-white/10">
            <AttachmentUpload 
              onAttachmentsChange={setAttachments}
            />
          </div>
        )}
        
        {/* Chat tools */}
        <div className="px-4 py-2 flex space-x-2 border-t border-white/10">
          <div className="flex space-x-1 overflow-x-auto">
            {QUICK_EMOJIS.slice(0, 3).map(emoji => (
              <button 
                key={emoji}
                onClick={() => setNewMessage(prev => prev + emoji)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
          
          {/* Quick Meeting Buttons */}
          <QuickMeetingButtons />
          
          <Button
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 hover:bg-white/20"
            onClick={() => setIsCodeDialogOpen(true)}
          >
            <Code className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 hover:bg-white/20"
            onClick={() => setIsPollDialogOpen(true)}
          >
            <BarChart2 className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t border-white/20 dark:border-white/10">
          <div className="space-y-2">
            <AttachmentUpload onAttachmentsChange={setAttachments} />
            
            <div className="relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={selectedRecipient 
                  ? `Message to ${allParticipants.find(p => p.id === selectedRecipient)?.name}...`
                  : "Type @ to mention, # for channels..."}
                className="pr-20 bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10"
              />
              <div className="absolute right-2 top-2 flex space-x-1">
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={newMessage.trim() === "" && attachments.length === 0}
                  className={cn(
                    "p-1 rounded-full transition-colors",
                    newMessage.trim() === "" && attachments.length === 0 ? 
                      "text-gray-400 dark:text-gray-600" : 
                      "text-primary hover:bg-primary/10"
                  )}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Code paste dialog */}
      <CodePasteDialog 
        isOpen={isCodeDialogOpen}
        onClose={() => setIsCodeDialogOpen(false)}
        onSubmit={handleCodeSubmit}
      />
      
      {/* Poll creation dialog */}
      <Dialog open={isPollDialogOpen} onOpenChange={setIsPollDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a Poll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="poll-question" className="block text-sm font-medium mb-1">
                Question
              </label>
              <input
                id="poll-question"
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Enter your question here..."
                className="w-full p-2 rounded bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Options
              </label>
              {pollOptions.map(option => (
                <div key={option.id} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updatePollOption(option.id, e.target.value)}
                    placeholder="Option text"
                    className="flex-1 p-2 rounded bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button 
                    onClick={() => removePollOption(option.id)}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addPollOption}
                className="mt-1"
              >
                Add Option
              </Button>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsPollDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePoll}>
              Create Poll
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedChatPanel;
