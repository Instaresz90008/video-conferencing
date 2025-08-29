
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface EmailSettingsSectionsProps {
  activeSection: string;
  settings: any;
  updateSetting: (key: string, value: any) => void;
}

const EmailSettingsSections: React.FC<EmailSettingsSectionsProps> = ({ 
  activeSection, 
  settings, 
  updateSetting 
}) => {
  switch (activeSection) {
    case 'notifications':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications for new emails</p>
              </div>
              <Switch 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Desktop Notifications</Label>
                <p className="text-sm text-muted-foreground">Show desktop notifications</p>
              </div>
              <Switch 
                checked={settings.desktopNotifications}
                onCheckedChange={(checked) => updateSetting('desktopNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Sound Notifications</Label>
                <p className="text-sm text-muted-foreground">Play sound for new emails</p>
              </div>
              <Switch 
                checked={settings.soundNotifications}
                onCheckedChange={(checked) => updateSetting('soundNotifications', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Email Sync Interval</Label>
              <Select value={settings.syncInterval} onValueChange={(value) => updateSetting('syncInterval', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Every minute</SelectItem>
                  <SelectItem value="5">Every 5 minutes</SelectItem>
                  <SelectItem value="15">Every 15 minutes</SelectItem>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                  <SelectItem value="manual">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      );

    case 'compose':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Compose & Send</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Email Signature</Label>
              <Textarea 
                value={settings.emailSignature}
                onChange={(e) => updateSetting('emailSignature', e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Reply</Label>
                <p className="text-sm text-muted-foreground">Send automatic replies when away</p>
              </div>
              <Switch 
                checked={settings.autoReply}
                onCheckedChange={(checked) => updateSetting('autoReply', checked)}
              />
            </div>

            {settings.autoReply && (
              <div className="space-y-2">
                <Label>Auto Reply Message</Label>
                <Textarea 
                  value={settings.autoReplyMessage}
                  onChange={(e) => updateSetting('autoReplyMessage', e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Undo Send Delay (seconds)</Label>
                <Select value={settings.undoSendDelay} onValueChange={(value) => updateSetting('undoSendDelay', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Disabled</SelectItem>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Priority</Label>
                <Select value={settings.priority} onValueChange={(value) => updateSetting('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case 'organization':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Organization & Filtering</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Threading</Label>
                <p className="text-sm text-muted-foreground">Group related emails into conversations</p>
              </div>
              <Switch 
                checked={settings.threadingEnabled}
                onCheckedChange={(checked) => updateSetting('threadingEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Sort to Folders</Label>
                <p className="text-sm text-muted-foreground">Automatically organize emails into folders</p>
              </div>
              <Switch 
                checked={settings.autoSortToFolders}
                onCheckedChange={(checked) => updateSetting('autoSortToFolders', checked)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mark as Read Delay (seconds)</Label>
                <Select value={settings.markAsReadDelay} onValueChange={(value) => updateSetting('markAsReadDelay', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Immediately</SelectItem>
                    <SelectItem value="3">3 seconds</SelectItem>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="manual">Manual only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Auto Archive After (days)</Label>
                <Select value={settings.autoArchiveAfter} onValueChange={(value) => updateSetting('autoArchiveAfter', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case 'security':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Security & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Spam Filtering</Label>
                <Switch 
                  checked={settings.spamFiltering}
                  onCheckedChange={(checked) => updateSetting('spamFiltering', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Phishing Protection</Label>
                <Switch 
                  checked={settings.phishingProtection}
                  onCheckedChange={(checked) => updateSetting('phishingProtection', checked)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Max Attachment Size (MB)</Label>
              <Select value={settings.maxAttachmentSize} onValueChange={(value) => updateSetting('maxAttachmentSize', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 MB</SelectItem>
                  <SelectItem value="25">25 MB</SelectItem>
                  <SelectItem value="50">50 MB</SelectItem>
                  <SelectItem value="100">100 MB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Allowed Domains</Label>
                <Input 
                  value={settings.allowedDomains}
                  onChange={(e) => updateSetting('allowedDomains', e.target.value)}
                  placeholder="example.com, company.org"
                />
              </div>
              <div className="space-y-2">
                <Label>Blocked Domains</Label>
                <Input 
                  value={settings.blockedDomains}
                  onChange={(e) => updateSetting('blockedDomains', e.target.value)}
                  placeholder="spam.com, unwanted.net"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case 'ai':
      return (
        <Card>
          <CardHeader>
            <CardTitle>AI Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>AI Suggestions</Label>
                <p className="text-sm text-muted-foreground">Get AI-powered email suggestions</p>
              </div>
              <Switch 
                checked={settings.aiSuggestions}
                onCheckedChange={(checked) => updateSetting('aiSuggestions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Smart Reply</Label>
                <p className="text-sm text-muted-foreground">Show AI-generated quick replies</p>
              </div>
              <Switch 
                checked={settings.smartReply}
                onCheckedChange={(checked) => updateSetting('smartReply', checked)}
              />
            </div>
          </CardContent>
        </Card>
      );

    case 'appearance':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Email Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select value={settings.fontSize} onValueChange={(value) => updateSetting('fontSize', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select value={settings.fontFamily} onValueChange={(value) => updateSetting('fontFamily', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System Default</SelectItem>
                    <SelectItem value="arial">Arial</SelectItem>
                    <SelectItem value="helvetica">Helvetica</SelectItem>
                    <SelectItem value="times">Times New Roman</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preview Pane</Label>
                <Select value={settings.previewPane} onValueChange={(value) => updateSetting('previewPane', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Compact View</Label>
                <Switch 
                  checked={settings.compactView}
                  onCheckedChange={(checked) => updateSetting('compactView', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Conversation View</Label>
                <Switch 
                  checked={settings.conversationView}
                  onCheckedChange={(checked) => updateSetting('conversationView', checked)}
                />
              </div>
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

export default EmailSettingsSections;
