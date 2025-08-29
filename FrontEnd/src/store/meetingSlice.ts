
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from "@/hooks/use-toast";
import { requestMediaPermissions, cleanupMedia } from './mediaSlice';

// Participant interface
export interface Participant {
  id: string;
  name: string;
  isVideo: boolean;
  isAudio: boolean;
  isSpeaking: boolean;
  isScreenSharing: boolean;
  isLocal: boolean;
  stream?: MediaStream;
}

// Meeting state interface
interface MeetingState {
  participants: Participant[];
  isMeetingJoined: boolean;
  isGridView: boolean;
  isChatOpen: boolean;
  roomName: string;
  displayName: string;
  isScreenSharing: boolean;
  joiningError: string | null;
}

// Mock participants for demo
const MOCK_PARTICIPANTS: Participant[] = [
  { id: "2", name: "Emma Johnson", isVideo: true, isAudio: true, isSpeaking: true, isScreenSharing: false, isLocal: false },
  { id: "3", name: "Michael Chen", isVideo: false, isAudio: true, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "4", name: "Sophia Rodriguez", isVideo: true, isAudio: false, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "5", name: "Liam Wilson", isVideo: true, isAudio: true, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "6", name: "Olivia Taylor", isVideo: false, isAudio: true, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "7", name: "Noah Martinez", isVideo: true, isAudio: true, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "8", name: "Ava Brown", isVideo: true, isAudio: false, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "9", name: "William Davis", isVideo: false, isAudio: false, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "10", name: "Isabella Miller", isVideo: true, isAudio: true, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "11", name: "James Garcia", isVideo: false, isAudio: true, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "12", name: "Charlotte Thompson", isVideo: true, isAudio: true, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "13", name: "Benjamin Nguyen", isVideo: true, isAudio: false, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "14", name: "Mia Lee", isVideo: false, isAudio: true, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "15", name: "Mason Patel", isVideo: true, isAudio: true, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "16", name: "Amelia Robinson", isVideo: true, isAudio: false, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "17", name: "Ethan Wright", isVideo: false, isAudio: true, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "18", name: "Harper Kim", isVideo: true, isAudio: true, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "19", name: "Samuel Kumar", isVideo: false, isAudio: false, isSpeaking: false, isScreenSharing: false, isLocal: false },
  { id: "20", name: "Evelyn Lopez", isVideo: true, isAudio: true, isSpeaking: false, isScreenSharing: false, isLocal: false },
];

// Initial state
const initialState: MeetingState = {
  participants: [],
  isMeetingJoined: false,
  isGridView: true,
  isChatOpen: false,
  roomName: "",
  displayName: "",
  isScreenSharing: false,
  joiningError: null,
};

// Async thunk for joining a meeting
export const joinMeeting = createAsyncThunk(
  'meeting/join',
  async ({ roomName, displayName }: { roomName: string, displayName: string }, { dispatch, getState, rejectWithValue }) => {
    try {
      // Request media permissions first
      const stream = await dispatch(requestMediaPermissions()).unwrap();
      
      const state = getState() as { media: { video: boolean, audio: boolean } };
      const { video, audio } = state.media;
      
      // Create local participant with stream
      const localParticipant: Participant = {
        id: "1",
        name: displayName,
        isVideo: video,
        isAudio: audio,
        isSpeaking: false,
        isScreenSharing: false,
        isLocal: true,
        stream
      };
      
      return { roomName, displayName, localParticipant };
    } catch (error) {
      console.error("Error joining meeting:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        title: "Failed to join meeting",
        description: errorMsg,
        variant: "destructive",
        open: true,
      });
      
      return rejectWithValue(errorMsg);
    }
  }
);

// Async thunk for leaving a meeting
export const leaveMeeting = createAsyncThunk(
  'meeting/leave',
  async (_, { dispatch }) => {
    await dispatch(cleanupMedia());
    
    toast({
      title: "Meeting left",
      description: "You've left the meeting",
      open: true,
    });
    
    return null;
  }
);

// Async thunk for toggling screen sharing
export const toggleScreenShare = createAsyncThunk(
  'meeting/toggleScreenShare',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { meeting: MeetingState };
    const { isScreenSharing } = state.meeting;
    
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        
        // Add event listener for when screen sharing stops
        screenStream.getTracks()[0].onended = () => {
          // We'll handle this in the component
        };
        
        toast({
          title: "Screen sharing started",
          description: "You are now sharing your screen",
          open: true,
        });
        
        return { isScreenSharing: true, screenStream };
      } else {
        toast({
          title: "Screen sharing stopped",
          description: "You have stopped sharing your screen",
          open: true,
        });
        
        return { isScreenSharing: false, screenStream: null };
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to share screen";
      
      toast({
        title: "Screen sharing error",
        description: errorMsg,
        variant: "destructive",
        open: true,
      });
      
      return rejectWithValue(errorMsg);
    }
  }
);

// Meeting slice
const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    updateParticipant: (state, action: PayloadAction<{ id: string, changes: Partial<Participant> }>) => {
      const { id, changes } = action.payload;
      const participantIndex = state.participants.findIndex(p => p.id === id);
      if (participantIndex !== -1) {
        state.participants[participantIndex] = {
          ...state.participants[participantIndex],
          ...changes
        };
      }
    },
    toggleChat: (state) => {
      state.isChatOpen = !state.isChatOpen;
    },
    toggleLayout: (state) => {
      state.isGridView = !state.isGridView;
    },
    endScreenSharing: (state) => {
      state.isScreenSharing = false;
      // Update the local participant's screen sharing status
      const localParticipantIndex = state.participants.findIndex(p => p.isLocal);
      if (localParticipantIndex !== -1) {
        state.participants[localParticipantIndex].isScreenSharing = false;
      }
    },
    clearJoiningError: (state) => {
      state.joiningError = null;
    },
    kickParticipant: (state, action: PayloadAction<string>) => {
      const participantId = action.payload;
      state.participants = state.participants.filter(p => p.id !== participantId);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(joinMeeting.pending, (state) => {
        state.joiningError = null;
      })
      .addCase(joinMeeting.fulfilled, (state, action) => {
        const { roomName, displayName, localParticipant } = action.payload;
        state.roomName = roomName;
        state.displayName = displayName;
        state.isMeetingJoined = true;
        state.participants = [localParticipant, ...MOCK_PARTICIPANTS];
        state.joiningError = null;
      })
      .addCase(joinMeeting.rejected, (state, action) => {
        state.joiningError = action.payload as string;
        state.isMeetingJoined = false;
      })
      .addCase(leaveMeeting.fulfilled, (state) => {
        state.isMeetingJoined = false;
        state.participants = [];
        state.roomName = "";
        state.displayName = "";
        state.isScreenSharing = false;
      })
      .addCase(toggleScreenShare.fulfilled, (state, action) => {
        const { isScreenSharing } = action.payload;
        state.isScreenSharing = isScreenSharing;
        
        // Update the local participant's screen sharing status
        const localParticipantIndex = state.participants.findIndex(p => p.isLocal);
        if (localParticipantIndex !== -1) {
          state.participants[localParticipantIndex].isScreenSharing = isScreenSharing;
        }
      });
  },
});

export const { updateParticipant, toggleChat, toggleLayout, endScreenSharing, clearJoiningError, kickParticipant } = meetingSlice.actions;
export default meetingSlice.reducer;
