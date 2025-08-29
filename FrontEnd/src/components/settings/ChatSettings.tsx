
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  MessageSquare, 
  Bell, 
  Shield, 
  Palette,
  Send,
  Save,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsPersistence } from '@/hooks/useSettingsPersistence';
import { useSettingsSearch } from '@/hooks/useSettingsSearch';
import { validateChatSettings } from '@/lib/settingsValidation';
import SettingsSearchBox from './SettingsSearchBox';
import ChatSettingsSections from './ChatSettingsSections';

const defaultChatSettings = {
  desktopNotifications: true,
  soundNotifications: true,
  emailNotifications: false,
  notificationVolume: [70],
  sendOnEnter: true,
  autoSaveDrafts: true,
  richTextFormatting: true,
  emojiReactions: true,
  messageHistory: '30' as const,
  readReceipts: true,
  onlineStatus: true,
  typingIndicators: true,
  autoDeleteMessages: 'never' as const,
  fontSize: 'medium' as const,
  chatTheme: 'system' as const,
  compactMode: false,
  showAvatars: true,
  showTimestamps: true
};

const searchableItems = [
  { id: 'desktopNotifications', label: 'Desktop notifications', category: 'notifications', description: 'Show notifications on your desktop', keywords: ['desktop', 'popup', 'alert'] },
  { id: 'soundNotifications', label: 'Sound notifications', category: 'notifications', description: 'Play sounds for new messages', keywords: ['sound', 'audio', 'alert'] },
  { id: 'emailNotifications', label: 'Email notifications', category: 'notifications', description: 'Send notifications to your email', keywords: ['email', 'mail'] },
  { id: 'sendOnEnter', label: 'Send on Enter', category: 'messaging', description: 'Send messages when pressing Enter', keywords: ['enter', 'send', 'shortcut'] },
  { id: 'autoSaveDrafts', label: 'Auto-save drafts', category: 'messaging', description: 'Automatically save message drafts', keywords: ['draft', 'save', 'auto'] },
  { id: 'richTextFormatting', label: 'Rich text formatting', category: 'messaging', description: 'Enable text formatting options', keywords: ['format', 'bold', 'italic'] },
  { id: 'emojiReactions', label: 'Emoji reactions', category: 'messaging', description: 'Allow emoji reactions on messages', keywords: ['emoji', 'react'] },
  { id: 'readReceipts', label: 'Read receipts', category: 'privacy', description: 'Show when messages are read', keywords: ['read', 'receipt', 'seen'] },
  { id: 'onlineStatus', label: 'Online status', category: 'privacy', description: 'Show your online status', keywords: ['status', 'online', 'presence'] },
  { id: 'fontSize', label: 'Font size', category: 'appearance', description: 'Text size in chat', keywords: ['font', 'size', 'text'] },
  { id: 'chatTheme', label: 'Chat theme', category: 'appearance', description: 'Visual theme for chat', keywords: ['theme', 'color', 'appearance'] },
  { id: 'compactMode', label: 'Compact mode', category: 'appearance', description: 'Use compact message layout', keywords: ['compact', 'dense', 'layout'] },
];

const ChatSettings = () => {
  const [activeSection, setActiveSection] = useState('notifications');
  
  const {
    settings,
    updateSetting,
    saveSettings,
    resetSettings,
    isLoading,
    isSaving,
    errors,
    hasUnsavedChanges
  } = useSettingsPersistence({
    storageKey: 'chatSettings',
    defaultSettings: defaultChatSettings,
    validateSettings: validateChatSettings,
    onSave: (settings) => {
      console.log('Chat settings saved:', settings);
      // Here you would connect to actual application functionality
    }
  });

  const {
    searchTerm,
    setSearchTerm,
    filteredItems,
    clearSearch,
    hasResults
  } = useSettingsSearch(searchableItems);

  const menuItems = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'messaging', label: 'Messaging', icon: Send },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const filteredMenuItems = searchTerm 
    ? menuItems.filter(item => 
        filteredItems.some(searchItem => searchItem.category === item.id)
      )
    : menuItems;

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[600px] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[600px]">
      {/* Left Sidebar Menu */}
      <div className="w-64 border-r bg-background/50 p-4">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-semibold">Chat Settings</h3>
        </div>
        
        {/* Search Box */}
        <div className="mb-4">
          <SettingsSearchBox
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClear={clearSearch}
            placeholder="Search chat settings..."
          />
        </div>

        {/* Search Results or Menu */}
        <nav className="space-y-1">
          {searchTerm && !hasResults ? (
            <div className="text-sm text-muted-foreground p-2">
              No settings found for "{searchTerm}"
            </div>
          ) : (
            filteredMenuItems.map((item) => {
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
            })
          )}
        </nav>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2">
          <Button 
            onClick={saveSettings} 
            disabled={isSaving || !hasUnsavedChanges}
            className="w-full"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          
          <Button 
            onClick={resetSettings}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mt-4 p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm font-medium text-destructive mb-1">Validation Errors:</p>
            <ul className="text-xs text-destructive space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges && (
          <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-xs text-warning">You have unsaved changes</p>
          </div>
        )}
      </div>

      {/* Right Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <ChatSettingsSections 
          activeSection={activeSection}
          settings={settings}
          updateSetting={updateSetting}
          searchTerm={searchTerm}
          filteredItems={filteredItems}
        />
      </div>
    </div>
  );
};

export default ChatSettings;
