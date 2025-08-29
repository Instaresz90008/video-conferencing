
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Mail, 
  Send, 
  Archive, 
  Shield, 
  Bot, 
  Palette,
  Bell 
} from 'lucide-react';
import EmailSettingsSections from './EmailSettingsSections';

const EmailSettings = () => {
  const [activeSection, setActiveSection] = useState('notifications');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    desktopNotifications: true,
    soundNotifications: false,
    emailSignature: 'Best regards,\nYour Name',
    autoReply: false,
    autoReplyMessage: 'Thank you for your email. I will get back to you soon.',
    syncInterval: '5',
    threadingEnabled: true,
    markAsReadDelay: '3',
    undoSendDelay: '10',
    confirmBeforeDelete: true,
    confirmBeforeSend: false,
    spamFiltering: true,
    phishingProtection: true,
    encryptEmails: false,
    autoArchiveAfter: '30',
    maxAttachmentSize: '25',
    allowedDomains: '',
    blockedDomains: '',
    autoSortToFolders: true,
    aiSuggestions: true,
    smartReply: true,
    emailTracking: false,
    readReceipts: false,
    priority: 'normal',
    defaultFormat: 'html',
    fontSize: 'medium',
    fontFamily: 'system',
    darkMode: 'auto',
    compactView: false,
    previewPane: 'bottom',
    conversationView: true
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const menuItems = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'compose', label: 'Compose & Send', icon: Send },
    { id: 'organization', label: 'Organization', icon: Archive },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'ai', label: 'AI Features', icon: Bot },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="flex h-full min-h-[600px]">
      {/* Left Sidebar Menu */}
      <div className="w-64 border-r bg-background/50 p-4">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="w-5 h-5" />
          <h3 className="font-semibold">Email Settings</h3>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left",
                  activeSection === item.id 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <EmailSettingsSections 
          activeSection={activeSection}
          settings={settings}
          updateSetting={updateSetting}
        />
      </div>
    </div>
  );
};

export default EmailSettings;
