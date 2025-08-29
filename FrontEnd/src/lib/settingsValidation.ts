
import { z } from 'zod';

// Meeting Settings Validation Schema
export const meetingSettingsSchema = z.object({
  autoJoinAudio: z.boolean(),
  autoJoinVideo: z.boolean(),
  defaultMicLevel: z.array(z.number().min(0).max(100)),
  defaultVideoQuality: z.enum(['low', 'medium', 'hd']),
  maxParticipants: z.number().min(1).max(1000),
  enableWaitingRoom: z.boolean(),
  allowScreenShare: z.boolean(),
  enableRecording: z.boolean(),
  muteOnJoin: z.boolean(),
  showParticipantNames: z.boolean(),
  enableReactions: z.boolean(),
  enableChat: z.boolean(),
  enableBreakoutRooms: z.boolean(),
  backgroundBlur: z.boolean(),
  noiseSuppression: z.boolean(),
  echoCancellation: z.boolean(),
});

// Chat Settings Validation Schema
export const chatSettingsSchema = z.object({
  desktopNotifications: z.boolean(),
  soundNotifications: z.boolean(),
  emailNotifications: z.boolean(),
  notificationVolume: z.array(z.number().min(0).max(100)),
  sendOnEnter: z.boolean(),
  autoSaveDrafts: z.boolean(),
  richTextFormatting: z.boolean(),
  emojiReactions: z.boolean(),
  messageHistory: z.enum(['7', '30', '90', 'forever']),
  readReceipts: z.boolean(),
  onlineStatus: z.boolean(),
  typingIndicators: z.boolean(),
  autoDeleteMessages: z.enum(['never', '24h', '7d', '30d']),
  fontSize: z.enum(['small', 'medium', 'large']),
  chatTheme: z.enum(['light', 'dark', 'system']),
  compactMode: z.boolean(),
  showAvatars: z.boolean(),
  showTimestamps: z.boolean(),
});

// Validation functions
export const validateMeetingSettings = (settings: any) => {
  try {
    meetingSettingsSchema.parse(settings);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { isValid: false, errors: ['Unknown validation error'] };
  }
};

export const validateChatSettings = (settings: any) => {
  try {
    chatSettingsSchema.parse(settings);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { isValid: false, errors: ['Unknown validation error'] };
  }
};

// Type exports
export type MeetingSettingsType = z.infer<typeof meetingSettingsSchema>;
export type ChatSettingsType = z.infer<typeof chatSettingsSchema>;
