
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { SearchableItem } from '@/hooks/useSettingsSearch';

interface MeetingSettingsSectionsProps {
  activeSection: string;
  settings: any;
  updateSetting: (key: string, value: any) => void;
  searchTerm: string;
  filteredItems: SearchableItem[];
}

const MeetingSettingsSections: React.FC<MeetingSettingsSectionsProps> = ({ 
  activeSection, 
  settings, 
  updateSetting,
  searchTerm,
  filteredItems
}) => {
  switch (activeSection) {
    case 'audio-video':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Audio & Video Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-join with audio</Label>
                <p className="text-sm text-muted-foreground">Automatically enable microphone when joining</p>
              </div>
              <Switch
                checked={settings.autoJoinAudio}
                onCheckedChange={(checked) => updateSetting('autoJoinAudio', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-join with video</Label>
                <p className="text-sm text-muted-foreground">Automatically enable camera when joining</p>
              </div>
              <Switch
                checked={settings.autoJoinVideo}
                onCheckedChange={(checked) => updateSetting('autoJoinVideo', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Default microphone level</Label>
              <Slider
                value={settings.defaultMicLevel}
                onValueChange={(value) => updateSetting('defaultMicLevel', value)}
                max={100}
                step={1}
              />
              <span className="text-sm text-muted-foreground">{settings.defaultMicLevel[0]}%</span>
            </div>

            <div className="space-y-2">
              <Label>Default video quality</Label>
              <Select 
                value={settings.defaultVideoQuality} 
                onValueChange={(value) => updateSetting('defaultVideoQuality', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (360p)</SelectItem>
                  <SelectItem value="medium">Medium (720p)</SelectItem>
                  <SelectItem value="hd">HD (1080p)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Mute participants on join</Label>
                <p className="text-sm text-muted-foreground">New participants join muted</p>
              </div>
              <Switch
                checked={settings.muteOnJoin}
                onCheckedChange={(checked) => updateSetting('muteOnJoin', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Background blur</Label>
                <p className="text-sm text-muted-foreground">Automatically blur background</p>
              </div>
              <Switch
                checked={settings.backgroundBlur}
                onCheckedChange={(checked) => updateSetting('backgroundBlur', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Noise suppression</Label>
                <p className="text-sm text-muted-foreground">Reduce background noise</p>
              </div>
              <Switch
                checked={settings.noiseSuppression}
                onCheckedChange={(checked) => updateSetting('noiseSuppression', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Echo cancellation</Label>
                <p className="text-sm text-muted-foreground">Prevent audio feedback</p>
              </div>
              <Switch
                checked={settings.echoCancellation}
                onCheckedChange={(checked) => updateSetting('echoCancellation', checked)}
              />
            </div>
          </CardContent>
        </Card>
      );

    case 'controls':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Meeting Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Maximum participants</Label>
              <Select 
                value={settings.maxParticipants.toString()} 
                onValueChange={(value) => updateSetting('maxParticipants', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 participants</SelectItem>
                  <SelectItem value="10">10 participants</SelectItem>
                  <SelectItem value="25">25 participants</SelectItem>
                  <SelectItem value="50">50 participants</SelectItem>
                  <SelectItem value="100">100 participants</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable waiting room</Label>
                <p className="text-sm text-muted-foreground">Admit participants manually</p>
              </div>
              <Switch
                checked={settings.enableWaitingRoom}
                onCheckedChange={(checked) => updateSetting('enableWaitingRoom', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow screen sharing</Label>
                <p className="text-sm text-muted-foreground">Participants can share screens</p>
              </div>
              <Switch
                checked={settings.allowScreenShare}
                onCheckedChange={(checked) => updateSetting('allowScreenShare', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable recording</Label>
                <p className="text-sm text-muted-foreground">Allow meetings to be recorded</p>
              </div>
              <Switch
                checked={settings.enableRecording}
                onCheckedChange={(checked) => updateSetting('enableRecording', checked)}
              />
            </div>
          </CardContent>
        </Card>
      );

    case 'security':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Privacy & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show participant names</Label>
                <p className="text-sm text-muted-foreground">Display names in video tiles</p>
              </div>
              <Switch
                checked={settings.showParticipantNames}
                onCheckedChange={(checked) => updateSetting('showParticipantNames', checked)}
              />
            </div>
          </CardContent>
        </Card>
      );

    case 'features':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Meeting Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable emoji reactions</Label>
                <p className="text-sm text-muted-foreground">Show emoji reactions in meetings</p>
              </div>
              <Switch
                checked={settings.enableReactions}
                onCheckedChange={(checked) => updateSetting('enableReactions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable chat</Label>
                <p className="text-sm text-muted-foreground">Allow text chat during meetings</p>
              </div>
              <Switch
                checked={settings.enableChat}
                onCheckedChange={(checked) => updateSetting('enableChat', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable breakout rooms</Label>
                <p className="text-sm text-muted-foreground">Create smaller group discussions</p>
              </div>
              <Switch
                checked={settings.enableBreakoutRooms}
                onCheckedChange={(checked) => updateSetting('enableBreakoutRooms', checked)}
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

export default MeetingSettingsSections;
