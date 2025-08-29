
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Video, 
  Users, 
  Shield, 
  Camera,
  Settings,
  Save,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsPersistence } from '@/hooks/useSettingsPersistence';
import { useSettingsSearch } from '@/hooks/useSettingsSearch';
import { validateMeetingSettings } from '@/lib/settingsValidation';
import SettingsSearchBox from './SettingsSearchBox';
import MeetingSettingsSections from './MeetingSettingsSections';

const defaultMeetingSettings = {
  autoJoinAudio: true,
  autoJoinVideo: false,
  defaultMicLevel: [80],
  defaultVideoQuality: 'hd' as const,
  maxParticipants: 25,
  enableWaitingRoom: true,
  allowScreenShare: true,
  enableRecording: false,
  muteOnJoin: false,
  showParticipantNames: true,
  enableReactions: true,
  enableChat: true,
  enableBreakoutRooms: true,
  backgroundBlur: true,
  noiseSuppression: true,
  echoCancellation: true
};

const searchableItems = [
  { id: 'autoJoinAudio', label: 'Auto-join with audio', category: 'audio-video', description: 'Automatically enable microphone when joining', keywords: ['microphone', 'audio', 'join'] },
  { id: 'autoJoinVideo', label: 'Auto-join with video', category: 'audio-video', description: 'Automatically enable camera when joining', keywords: ['camera', 'video', 'join'] },
  { id: 'defaultMicLevel', label: 'Default microphone level', category: 'audio-video', keywords: ['microphone', 'volume', 'level'] },
  { id: 'defaultVideoQuality', label: 'Default video quality', category: 'audio-video', keywords: ['quality', 'resolution', 'hd'] },
  { id: 'maxParticipants', label: 'Maximum participants', category: 'controls', keywords: ['limit', 'capacity'] },
  { id: 'enableWaitingRoom', label: 'Enable waiting room', category: 'security', keywords: ['security', 'admit', 'waiting'] },
  { id: 'allowScreenShare', label: 'Allow screen sharing', category: 'controls', keywords: ['screen', 'share', 'presentation'] },
  { id: 'enableRecording', label: 'Enable recording', category: 'controls', keywords: ['record', 'save'] },
  { id: 'enableReactions', label: 'Enable emoji reactions', category: 'features', keywords: ['emoji', 'reactions'] },
  { id: 'enableChat', label: 'Enable chat', category: 'features', keywords: ['text', 'message'] },
  { id: 'enableBreakoutRooms', label: 'Enable breakout rooms', category: 'features', keywords: ['breakout', 'groups'] },
];

const MeetingSettings = () => {
  const [activeSection, setActiveSection] = useState('audio-video');
  
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
    storageKey: 'meetingSettings',
    defaultSettings: defaultMeetingSettings,
    validateSettings: validateMeetingSettings,
    onSave: (settings) => {
      console.log('Meeting settings saved:', settings);
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
    { id: 'audio-video', label: 'Audio & Video', icon: Camera },
    { id: 'controls', label: 'Meeting Controls', icon: Users },
    { id: 'security', label: 'Privacy & Security', icon: Shield },
    { id: 'features', label: 'Features', icon: Settings },
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
          <Video className="w-5 h-5" />
          <h3 className="font-semibold">Meeting Settings</h3>
        </div>
        
        {/* Search Box */}
        <div className="mb-4">
          <SettingsSearchBox
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClear={clearSearch}
            placeholder="Search meeting settings..."
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
        <MeetingSettingsSections 
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

export default MeetingSettings;
