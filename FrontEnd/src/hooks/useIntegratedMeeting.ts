import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  joinMeeting, 
  leaveMeeting, 
  toggleScreenShare, 
  updateParticipant 
} from '@/store/meetingSlice';
import { 
  toggleVideoThunk, 
  toggleAudioThunk, 
  requestMediaPermissions,
  cleanupMedia 
} from '@/store/mediaSlice';
import { 
  toggleChat, 
  sendMessage, 
  markMessagesAsRead 
} from '@/store/chatSlice';
import { 
  togglePanel, 
  toggleHandRaised, 
  toggleRecording,
  setVideoLayout,
  setBackgroundImage,
  setBurstEmoji 
} from '@/store/uiSlice';
import { toast } from "@/hooks/use-toast";
import { webRTCService } from '@/services/webRTCService';
import { offlineService } from '@/services/offlineService';

export const useIntegratedMeeting = () => {
  const dispatch = useAppDispatch();
  
  // Selectors with default fallbacks
  const meeting = useAppSelector(state => state.meeting || { 
    isMeetingJoined: false, 
    displayName: '', 
    participants: [] 
  });
  const media = useAppSelector(state => state.media || { 
    initialized: false, 
    loading: false 
  });
  const chat = useAppSelector(state => state.chat || { 
    isOpen: false, 
    isFullScreen: false, 
    messages: [], 
    unreadCount: 0 
  });
  const ui = useAppSelector(state => state.ui || {
    videoLayout: 'speaker',
    backgroundImage: null,
    handRaised: false,
    isRecording: false,
    burstEmoji: null,
    isParticipantsPanelOpen: false,
    isBackgroundSelectorOpen: false,
    isAgendaOpen: false,
    isBreakoutRoomsOpen: false,
    isAdvancedControlsOpen: false,
    isMomOpen: false,
    isSentimentOpen: false,
    isTimelineOpen: false,
    isActionItemsOpen: false
  });

  // Meeting controls
  const handleJoinMeeting = useCallback(async (displayName: string, meetingId: string, password?: string) => {
    if (!displayName?.trim() || !meetingId?.trim()) {
      toast({
        title: "Invalid input",
        description: "Display name and meeting ID are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await webRTCService.initializeMedia();
      
      // Use the correct parameter structure that matches the updated meetingSlice
      await dispatch(joinMeeting({ 
        displayName, 
        meetingId,  // Changed from roomName to meetingId
        password 
      })).unwrap();
      
      await webRTCService.joinMeeting(meetingId, displayName);
      
      dispatch(markMessagesAsRead());
      
      toast({
        title: "Meeting joined",
        description: `Connected to meeting`,
      });
    } catch (error) {
      console.error('Failed to join meeting:', error);
      
      offlineService.addOfflineAction('join_meeting', {
        displayName,
        meetingId,  // Changed from roomName to meetingId
        timestamp: Date.now()
      });
      
      toast({
        title: "Connection failed",
        description: "Saved for when you're back online",
        variant: "destructive",
      });
    }
  }, [dispatch]);

  const handleLeaveMeeting = useCallback(async () => {
    try {
      webRTCService.disconnect();
      await dispatch(leaveMeeting()).unwrap();
      dispatch(toggleChat());
      
      toast({
        title: "Left meeting",
        description: "You have left the meeting",
      });
    } catch (error) {
      console.error('Failed to leave meeting:', error);
    }
  }, [dispatch]);

  // Media controls
  const handleToggleVideo = useCallback(() => {
    if (!meeting.isMeetingJoined) {
      toast({
        title: "Not in meeting",
        description: "Please join a meeting first",
        variant: "destructive",
      });
      return;
    }
    dispatch(toggleVideoThunk());
  }, [dispatch, meeting.isMeetingJoined]);

  const handleToggleAudio = useCallback(() => {
    if (!meeting.isMeetingJoined) {
      toast({
        title: "Not in meeting", 
        description: "Please join a meeting first",
        variant: "destructive",
      });
      return;
    }
    dispatch(toggleAudioThunk());
  }, [dispatch, meeting.isMeetingJoined]);

  const handleToggleScreenShare = useCallback(() => {
    if (!meeting.isMeetingJoined) {
      toast({
        title: "Not in meeting",
        description: "Please join a meeting first", 
        variant: "destructive",
      });
      return;
    }
    dispatch(toggleScreenShare());
  }, [dispatch, meeting.isMeetingJoined]);

  // UI handlers
  const handleEmojiClick = useCallback((emoji: string) => {
    dispatch(setBurstEmoji({ emoji, key: Date.now() }));
    setTimeout(() => {
      dispatch(setBurstEmoji(null));
    }, 3000);
  }, [dispatch]);

  const handleBackgroundChange = useCallback((background: string | null) => {
    dispatch(setBackgroundImage(background));
  }, [dispatch]);

  const handleLayoutChange = useCallback((layout: 'grid' | 'speaker' | 'pip' | 'pbp' | 'list') => {
    dispatch(setVideoLayout(layout));
  }, [dispatch]);

  const handleToggleRecording = useCallback(() => {
    dispatch(toggleRecording());
  }, [dispatch]);

  const handleRaiseHand = useCallback(() => {
    dispatch(toggleHandRaised());
  }, [dispatch]);

  // Chat controls
  const handleSendMessage = useCallback((text: string, type: 'text' | 'code' | 'attachment' = 'text', extra?: any) => {
    if (!meeting.isMeetingJoined) {
      toast({
        title: "Not in meeting",
        description: "Please join a meeting to send messages",
        variant: "destructive", 
      });
      return;
    }

    if (!text?.trim() && type === 'text') {
      return;
    }

    dispatch(sendMessage({
      text,
      sender: meeting.displayName || 'Anonymous',
      type,
      ...extra
    }));
  }, [dispatch, meeting.isMeetingJoined, meeting.displayName]);

  return {
    // State
    meeting,
    media,
    chat,
    ui,
    
    // Meeting actions
    handleJoinMeeting,
    handleLeaveMeeting,
    
    // Media actions
    handleToggleVideo,
    handleToggleAudio,
    handleToggleScreenShare,
    
    // UI actions
    handleEmojiClick,
    handleBackgroundChange,
    handleLayoutChange,
    handleToggleRecording,
    handleRaiseHand,
    
    // Chat actions
    handleSendMessage,
    toggleChat: () => dispatch(toggleChat()),
    
    // Panel actions
    togglePanel: (panel: any) => dispatch(togglePanel(panel)),
  };
};