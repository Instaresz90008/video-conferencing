
import { useState, useEffect, useCallback } from 'react';
import { LocalStorageManager } from '@/lib/localStorage';
import { toast } from '@/hooks/use-toast';

export interface SettingsState {
  [key: string]: any;
}

export interface UseSettingsPersistenceOptions {
  storageKey: string;
  defaultSettings: SettingsState;
  validateSettings?: (settings: SettingsState) => { isValid: boolean; errors: string[] };
  onSave?: (settings: SettingsState) => void;
  onLoad?: (settings: SettingsState) => void;
}

export const useSettingsPersistence = ({
  storageKey,
  defaultSettings,
  validateSettings,
  onSave,
  onLoad
}: UseSettingsPersistenceOptions) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const savedSettings = LocalStorageManager.get(storageKey, defaultSettings);
        
        // Merge with defaults to ensure all keys exist
        const mergedSettings = { ...defaultSettings, ...savedSettings };
        
        setSettings(mergedSettings);
        onLoad?.(mergedSettings);
      } catch (error) {
        console.error(`Failed to load settings for ${storageKey}:`, error);
        toast({
          title: "Settings Load Error",
          description: "Failed to load saved settings. Using defaults.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [storageKey, defaultSettings, onLoad]);

  // Update a single setting
  const updateSetting = useCallback((key: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Validate if validator provided
      if (validateSettings) {
        const validation = validateSettings(newSettings);
        setErrors(validation.errors);
        
        if (!validation.isValid) {
          toast({
            title: "Invalid Setting",
            description: validation.errors[0] || "Invalid setting value",
            variant: "destructive",
          });
          return prev; // Don't update if invalid
        }
      }
      
      setErrors([]);
      return newSettings;
    });
  }, [validateSettings]);

  // Save settings to storage
  const saveSettings = useCallback(async () => {
    try {
      setIsSaving(true);
      
      // Final validation before save
      if (validateSettings) {
        const validation = validateSettings(settings);
        if (!validation.isValid) {
          setErrors(validation.errors);
          toast({
            title: "Validation Failed",
            description: "Please fix the errors before saving",
            variant: "destructive",
          });
          return false;
        }
      }

      LocalStorageManager.set(storageKey, settings);
      onSave?.(settings);
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been saved successfully",
      });
      
      return true;
    } catch (error) {
      console.error(`Failed to save settings for ${storageKey}:`, error);
      toast({
        title: "Save Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings, storageKey, validateSettings, onSave]);

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    setErrors([]);
    LocalStorageManager.set(storageKey, defaultSettings);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults",
    });
  }, [defaultSettings, storageKey]);

  return {
    settings,
    updateSetting,
    saveSettings,
    resetSettings,
    isLoading,
    isSaving,
    errors,
    hasUnsavedChanges: JSON.stringify(settings) !== JSON.stringify(LocalStorageManager.get(storageKey, defaultSettings))
  };
};
