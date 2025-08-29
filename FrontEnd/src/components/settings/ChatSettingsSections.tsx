
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableItem } from '@/hooks/useSettingsSearch';

interface ChatSettingsSectionsProps {
  activeSection: string;
  settings: any;
  updateSetting: (key: string, value: any) => void;
  searchTerm: string;
  filteredItems: SearchableItem[];
}

const ChatSettingsSections: React.FC<ChatSettingsSectionsProps> = ({ 
  activeSection, 
  settings, 
  updateSetting,
  searchTerm,
  filteredItems
}) => {
  switch (activeSection) {
    case 'notifications':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Chat Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Desktop Notifications</Label>
                <p className="text-sm text-muted-foreground">Show notifications for new messages</p>
              </div>
              <Switch 
                checked={settings.desktopNotifications}
                onCheckedChange={(checked) => updateSetting('desktopNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Sound Notifications</Label>
                <p className="text-sm text-muted-foreground">Play sound for new messages</p>
              </div>
              <Switch 
                checked={settings.soundNotifications}
                onCheckedChange={(checked) => updateSetting('soundNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send email for missed messages</p>
              </div>
              <Switch 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Notification Volume</Label>
              <Slider
                value={settings.notificationVolume}
                onValueChange={(value) => updateSetting('notificationVolume', value)}
                max={100}
                step={1}
              />
              <span className="text-sm text-muted-foreground">{settings.notificationVolume[0]}%</span>
            </div>
          </CardContent>
        </Card>
      );

    case 'messaging':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Messaging Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Send on Enter</Label>
                <p className="text-sm text-muted-foreground">Send messages with Enter key</p>
              </div>
              <Switch 
                checked={settings.sendOnEnter}
                onCheckedChange={(checked) => updateSetting('sendOnEnter', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-save Drafts</Label>
                <p className="text-sm text-muted-foreground">Save unsent messages automatically</p>
              </div>
              <Switch 
                checked={settings.autoSaveDrafts}
                onCheckedChange={(checked) => updateSetting('autoSaveDrafts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Rich Text Formatting</Label>
                <p className="text-sm text-muted-foreground">Enable bold, italic, and other formatting</p>
              </div>
              <Switch 
                checked={settings.richTextFormatting}
                onCheckedChange={(checked) => updateSetting('richTextFormatting', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Emoji Reactions</Label>
                <p className="text-sm text-muted-foreground">Allow emoji reactions to messages</p>
              </div>
              <Switch 
                checked={settings.emojiReactions}
                onCheckedChange={(checked) => updateSetting('emojiReactions', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Message History</Label>
              <Select 
                value={settings.messageHistory} 
                onValueChange={(value) => updateSetting('messageHistory', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      );

    case 'privacy':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Privacy & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Read Receipts</Label>
                <p className="text-sm text-muted-foreground">Show when you've read messages</p>
              </div>
              <Switch 
                checked={settings.readReceipts}
                onCheckedChange={(checked) => updateSetting('readReceipts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Online Status</Label>
                <p className="text-sm text-muted-foreground">Show when you're online</p>
              </div>
              <Switch 
                checked={settings.onlineStatus}
                onCheckedChange={(checked) => updateSetting('onlineStatus', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Typing Indicators</Label>
                <p className="text-sm text-muted-foreground">Show when you're typing</p>
              </div>
              <Switch 
                checked={settings.typingIndicators}
                onCheckedChange={(checked) => updateSetting('typingIndicators', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Auto-delete Messages</Label>
              <Select 
                value={settings.autoDeleteMessages} 
                onValueChange={(value) => updateSetting('autoDeleteMessages', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="24h">After 24 hours</SelectItem>
                  <SelectItem value="7d">After 7 days</SelectItem>
                  <SelectItem value="30d">After 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      );

    case 'appearance':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Chat Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select 
                value={settings.fontSize} 
                onValueChange={(value) => updateSetting('fontSize', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="extra-large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <Select 
                value={settings.chatTheme} 
                onValueChange={(value) => updateSetting('chatTheme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System Default</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Show more messages in less space</p>
              </div>
              <Switch 
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSetting('compactMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Avatars</Label>
                <p className="text-sm text-muted-foreground">Display profile pictures</p>
              </div>
              <Switch 
                checked={settings.showAvatars}
                onCheckedChange={(checked) => updateSetting('showAvatars', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Timestamps</Label>
                <p className="text-sm text-muted-foreground">Display message timestamps</p>
              </div>
              <Switch 
                checked={settings.showTimestamps}
                onCheckedChange={(checked) => updateSetting('showTimestamps', checked)}
              />
            </div>
          </CardContent>
        </Card>
      );

    default:
      return (
        <div className="text-center text-muted-foreground">
          Select a section from the menu to configure settings
        </div>
      );
  }
};

export default ChatSettingsSections;
