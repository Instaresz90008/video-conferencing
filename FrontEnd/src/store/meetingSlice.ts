// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { toast } from "@/hooks/use-toast";
// import { requestMediaPermissions, cleanupMedia } from './mediaSlice';
// import { meetingApi, MeetingRoom } from '@/services/meetingApi';
// import { realTimeService } from '@/services/realTimeService';

// // Participant interface
// export interface Participant {
//   id: string;
//   name: string;
//   isVideo: boolean;
//   isAudio: boolean;
//   isSpeaking: boolean;
//   isScreenSharing: boolean;
//   isLocal: boolean;
//   stream?: MediaStream;
//   joinedAt?: string;
//   isHost?: boolean;
// }

// // Meeting state interface
// interface MeetingState {
//   participants: Participant[];
//   isMeetingJoined: boolean;
//   isGridView: boolean;
//   isChatOpen: boolean;
//   roomName: string;
//   displayName: string;
//   isScreenSharing: boolean;
//   joiningError: string | null;
//   loading: boolean;
//   meetingRoom: MeetingRoom | null;
//   participantId: string | null;
//   isHost: boolean;
//   connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'failed';
// }

// // Initial state
// const initialState: MeetingState = {
//   participants: [],
//   isMeetingJoined: false,
//   isGridView: true,
//   isChatOpen: false,
//   roomName: "",
//   displayName: "",
//   isScreenSharing: false,
//   joiningError: null,
//   loading: false,
//   meetingRoom: null,
//   participantId: null,
//   isHost: false,
//   connectionStatus: 'disconnected',
// };

// // Async thunk for creating a meeting
// export const createMeeting = createAsyncThunk(
//   'meeting/create',
//   async (data: { name: string, hostName: string, isPublic: boolean, password?: string, maxParticipants?: number }, { rejectWithValue }) => {
//     try {
//       const meeting = await meetingApi.createMeeting(data);
      
//       toast({
//         title: "Meeting created",
//         description: `Meeting "${meeting.name}" created successfully`,
//         open: true,
//       });
      
//       return meeting;
//     } catch (error) {
//       console.error("Error creating meeting:", error);
//       const errorMsg = error instanceof Error ? error.message : "Failed to create meeting";
      
//       toast({
//         title: "Failed to create meeting",
//         description: errorMsg,
//         variant: "destructive",
//         open: true,
//       });
      
//       return rejectWithValue(errorMsg);
//     }
//   }
// );

// // Async thunk for joining a meeting
// export const joinMeeting = createAsyncThunk(
//   'meeting/join',
//   async ({ meetingId, displayName, password }: { meetingId: string, displayName: string, password?: string }, { dispatch, getState, rejectWithValue }) => {
//     try {
//       dispatch(setConnectionStatus('connecting'));
      
//       // Extract and validate meeting ID first
//       const validMeetingId = meetingApi.extractMeetingId(meetingId);
//       if (!validMeetingId) {
//         throw new Error(`Invalid meeting ID format: ${meetingId}`);
//       }
      
//       // First, get meeting details using the VALIDATED meeting ID
//       const meetingRoom = await meetingApi.getMeeting(validMeetingId);
//       if (!meetingRoom) {
//         throw new Error("Meeting not found");
//       }
      
//       // Check if password is required
//       if (!meetingRoom.isPublic && meetingRoom.password && meetingRoom.password !== password) {
//         throw new Error("Invalid password");
//       }
      
//       // Request media permissions first
//       const stream = await dispatch(requestMediaPermissions()).unwrap();
      
//       const state = getState() as { media: { video: boolean, audio: boolean } };
//       const { video, audio } = state.media;
      
//       // Join the meeting via API using the VALIDATED meeting ID
//       const joinResult = await meetingApi.joinMeeting({
//         meetingId: validMeetingId,
//         participantName: displayName,
//         password: password
//       });
      
//       if (!joinResult.success) {
//         throw new Error("Failed to join meeting");
//       }
      
//       // Create local participant with stream
//       const localParticipant: Participant = {
//         id: joinResult.participantId || "local_" + Date.now(),
//         name: displayName,
//         isVideo: video,
//         isAudio: audio,
//         isSpeaking: false,
//         isScreenSharing: false,
//         isLocal: true,
//         stream,
//         joinedAt: new Date().toISOString(),
//         isHost: meetingRoom.hostName === displayName
//       };
      
//       // Subscribe to real-time participant updates using VALIDATED meeting ID
//       realTimeService.subscribe(`meeting:${validMeetingId}:participants`, (data) => {
//         dispatch(handleParticipantUpdate(data));
//       });
      
//       // Subscribe to meeting events using VALIDATED meeting ID
//       realTimeService.subscribe(`meeting:${validMeetingId}:events`, (data) => {
//         dispatch(handleMeetingEvent(data));
//       });
      
//       dispatch(setConnectionStatus('connected'));
      
//       toast({
//         title: "Joined meeting",
//         description: `Successfully joined "${meetingRoom.name}"`,
//         open: true,
//       });
      
//       return { 
//         roomName: validMeetingId, // Store the VALID meeting ID, not the name
//         displayName, 
//         localParticipant, 
//         meetingRoom,
//         participantId: joinResult.participantId || localParticipant.id,
//         isHost: meetingRoom.hostName === displayName
//       };
//     } catch (error) {
//       console.error("Error joining meeting:", error);
//       const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      
//       dispatch(setConnectionStatus('failed'));
      
//       toast({
//         title: "Failed to join meeting",
//         description: errorMsg,
//         variant: "destructive",
//         open: true,
//       });
      
//       return rejectWithValue(errorMsg);
//     }
//   }
// );

// // Async thunk for leaving a meeting
// export const leaveMeeting = createAsyncThunk(
//   'meeting/leave',
//   async (_, { dispatch, getState }) => {
//     const state = getState() as { meeting: MeetingState };
//     const { roomName, participantId } = state.meeting;
    
//     try {
//       // Leave meeting via API
//       if (roomName && participantId) {
//         await meetingApi.leaveMeeting(roomName, participantId);
//       }
      
//       // Cleanup media resources
//       await dispatch(cleanupMedia());
      
//       // Unsubscribe from real-time updates
//       if (roomName) {
//         realTimeService.unsubscribe(`meeting:${roomName}:participants`);
//         realTimeService.unsubscribe(`meeting:${roomName}:events`);
//       }
      
//       toast({
//         title: "Meeting left",
//         description: "You've left the meeting",
//         open: true,
//       });
      
//       return null;
//     } catch (error) {
//       console.error("Error leaving meeting:", error);
//       // Still proceed with local cleanup even if API call fails
//       await dispatch(cleanupMedia());
//       return null;
//     }
//   }
// );

// // Async thunk for toggling screen sharing
// export const toggleScreenShare = createAsyncThunk(
//   'meeting/toggleScreenShare',
//   async (_, { getState, rejectWithValue }) => {
//     const state = getState() as { meeting: MeetingState };
//     const { isScreenSharing, roomName, participantId } = state.meeting;
    
//     try {
//       if (!isScreenSharing) {
//         const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        
//         // Add event listener for when screen sharing stops
//         screenStream.getTracks()[0].onended = () => {
//           // This will be handled in the component to dispatch endScreenSharing
//         };
        
//         // Notify other participants via real-time service
//         if (roomName && participantId) {
//           realTimeService.send({
//             type: 'screen_share_started',
//             meetingId: roomName,
//             participantId: participantId
//           });
//         }
        
//         toast({
//           title: "Screen sharing started",
//           description: "You are now sharing your screen",
//           open: true,
//         });
        
//         return { isScreenSharing: true, screenStream };
//       } else {
//         // Notify other participants via real-time service
//         if (roomName && participantId) {
//           realTimeService.send({
//             type: 'screen_share_stopped',
//             meetingId: roomName,
//             participantId: participantId
//           });
//         }
        
//         toast({
//           title: "Screen sharing stopped",
//           description: "You have stopped sharing your screen",
//           open: true,
//         });
        
//         return { isScreenSharing: false, screenStream: null };
//       }
//     } catch (error) {
//       console.error("Error toggling screen share:", error);
//       const errorMsg = error instanceof Error ? error.message : "Failed to share screen";
      
//       toast({
//         title: "Screen sharing error",
//         description: errorMsg,
//         variant: "destructive",
//         open: true,
//       });
      
//       return rejectWithValue(errorMsg);
//     }
//   }
// );

// // Async thunk for fetching participants
// export const fetchParticipants = createAsyncThunk(
//   'meeting/fetchParticipants',
//   async (meetingId: string, { rejectWithValue }) => {
//     try {
//       // Validate meeting ID before fetching
//       const validMeetingId = meetingApi.extractMeetingId(meetingId);
//       if (!validMeetingId) {
//         throw new Error(`Invalid meeting ID format: ${meetingId}`);
//       }
      
//       const participants = await meetingApi.getParticipants(validMeetingId);
//       return participants.map((p: any) => ({
//         ...p,
//         isLocal: false, // All fetched participants are remote
//         isSpeaking: false, // Will be updated via real-time
//       }));
//     } catch (error) {
//       console.error("Error fetching participants:", error);
//       return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch participants");
//     }
//   }
// );

// // Meeting slice
// const meetingSlice = createSlice({
//   name: 'meeting',
//   initialState,
//   reducers: {
//     updateParticipant: (state, action: PayloadAction<{ id: string, changes: Partial<Participant> }>) => {
//       const { id, changes } = action.payload;
//       const participantIndex = state.participants.findIndex(p => p.id === id);
//       if (participantIndex !== -1) {
//         state.participants[participantIndex] = {
//           ...state.participants[participantIndex],
//           ...changes
//         };
//       }
//     },
//     addParticipant: (state, action: PayloadAction<Participant>) => {
//       const existingIndex = state.participants.findIndex(p => p.id === action.payload.id);
//       if (existingIndex === -1) {
//         state.participants.push(action.payload);
//       }
//     },
//     removeParticipant: (state, action: PayloadAction<string>) => {
//       state.participants = state.participants.filter(p => p.id !== action.payload);
//     },
//     toggleChat: (state) => {
//       state.isChatOpen = !state.isChatOpen;
//     },
//     toggleLayout: (state) => {
//       state.isGridView = !state.isGridView;
//     },
//     endScreenSharing: (state) => {
//       state.isScreenSharing = false;
//       // Update the local participant's screen sharing status
//       const localParticipantIndex = state.participants.findIndex(p => p.isLocal);
//       if (localParticipantIndex !== -1) {
//         state.participants[localParticipantIndex].isScreenSharing = false;
//       }
//     },
//     clearJoiningError: (state) => {
//       state.joiningError = null;
//     },
//     kickParticipant: (state, action: PayloadAction<string>) => {
//       const participantId = action.payload;
//       state.participants = state.participants.filter(p => p.id !== participantId);
      
//       // Send kick event via real-time service
//       if (state.roomName && state.isHost) {
//         realTimeService.send({
//           type: 'participant_kicked',
//           meetingId: state.roomName,
//           participantId: participantId
//         });
//       }
//     },
//     setConnectionStatus: (state, action: PayloadAction<MeetingState['connectionStatus']>) => {
//       state.connectionStatus = action.payload;
//     },
//     handleParticipantUpdate: (state, action: PayloadAction<any>) => {
//       // Handle real-time participant updates
//       const { type, participantId, data } = action.payload;
      
//       switch (type) {
//         case 'participant_joined':
//           const existingParticipant = state.participants.find(p => p.id === participantId);
//           if (!existingParticipant) {
//             state.participants.push({
//               ...data,
//               isLocal: false,
//               isSpeaking: false,
//             });
//           }
//           break;
//         case 'participant_left':
//           state.participants = state.participants.filter(p => p.id !== participantId);
//           break;
//         case 'participant_updated':
//           const participantIndex = state.participants.findIndex(p => p.id === participantId);
//           if (participantIndex !== -1) {
//             state.participants[participantIndex] = {
//               ...state.participants[participantIndex],
//               ...data
//             };
//           }
//           break;
//       }
//     },
//     handleMeetingEvent: (state, action: PayloadAction<any>) => {
//       // Handle real-time meeting events
//       const { type, data } = action.payload;
      
//       switch (type) {
//         case 'meeting_ended':
//           // Meeting was ended by host
//           state.isMeetingJoined = false;
//           state.participants = [];
//           toast({
//             title: "Meeting ended",
//             description: "The meeting has been ended by the host",
//             variant: "default",
//             open: true,
//           });
//           break;
//         case 'participant_speaking':
//           const speakingParticipant = state.participants.find(p => p.id === data.participantId);
//           if (speakingParticipant) {
//             speakingParticipant.isSpeaking = data.isSpeaking;
//           }
//           break;
//         case 'screen_share_started':
//           const sharingParticipant = state.participants.find(p => p.id === data.participantId);
//           if (sharingParticipant) {
//             sharingParticipant.isScreenSharing = true;
//           }
//           break;
//         case 'screen_share_stopped':
//           const stoppedSharingParticipant = state.participants.find(p => p.id === data.participantId);
//           if (stoppedSharingParticipant) {
//             stoppedSharingParticipant.isScreenSharing = false;
//           }
//           break;
//       }
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Create Meeting
//       .addCase(createMeeting.pending, (state) => {
//         state.loading = true;
//         state.joiningError = null;
//       })
//       .addCase(createMeeting.fulfilled, (state, action) => {
//         state.loading = false;
//         state.meetingRoom = action.payload;
//         state.isHost = true;
//       })
//       .addCase(createMeeting.rejected, (state, action) => {
//         state.loading = false;
//         state.joiningError = action.payload as string;
//       })
//       // Join Meeting
//       .addCase(joinMeeting.pending, (state) => {
//         state.loading = true;
//         state.joiningError = null;
//         state.connectionStatus = 'connecting';
//       })
//       .addCase(joinMeeting.fulfilled, (state, action) => {
//         const { roomName, displayName, localParticipant, meetingRoom, participantId, isHost } = action.payload;
//         state.loading = false;
//         state.roomName = roomName; // This is now the validated meeting ID
//         state.displayName = displayName;
//         state.isMeetingJoined = true;
//         state.participants = [localParticipant];
//         state.joiningError = null;
//         state.meetingRoom = meetingRoom;
//         state.participantId = participantId;
//         state.isHost = isHost;
//         state.connectionStatus = 'connected';
//       })
//       .addCase(joinMeeting.rejected, (state, action) => {
//         state.loading = false;
//         state.joiningError = action.payload as string;
//         state.isMeetingJoined = false;
//         state.connectionStatus = 'failed';
//       })
//       // Leave Meeting
//       .addCase(leaveMeeting.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(leaveMeeting.fulfilled, (state) => {
//         state.loading = false;
//         state.isMeetingJoined = false;
//         state.participants = [];
//         state.roomName = "";
//         state.displayName = "";
//         state.isScreenSharing = false;
//         state.meetingRoom = null;
//         state.participantId = null;
//         state.isHost = false;
//         state.connectionStatus = 'disconnected';
//       })
//       // Toggle Screen Share
//       .addCase(toggleScreenShare.fulfilled, (state, action) => {
//         const { isScreenSharing } = action.payload;
//         state.isScreenSharing = isScreenSharing;
        
//         // Update the local participant's screen sharing status
//         const localParticipantIndex = state.participants.findIndex(p => p.isLocal);
//         if (localParticipantIndex !== -1) {
//           state.participants[localParticipantIndex].isScreenSharing = isScreenSharing;
//         }
//       })
//       // Fetch Participants
//       .addCase(fetchParticipants.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchParticipants.fulfilled, (state, action) => {
//         state.loading = false;
//         // Merge remote participants with local participant
//         const remoteParticipants = action.payload;
//         const localParticipant = state.participants.find(p => p.isLocal);
//         state.participants = localParticipant ? [localParticipant, ...remoteParticipants] : remoteParticipants;
//       })
//       .addCase(fetchParticipants.rejected, (state, action) => {
//         state.loading = false;
//         console.error("Failed to fetch participants:", action.payload);
//       });
//   },
// });

// export const { 
//   updateParticipant, 
//   addParticipant,
//   removeParticipant,
//   toggleChat, 
//   toggleLayout, 
//   endScreenSharing, 
//   clearJoiningError, 
//   kickParticipant,
//   setConnectionStatus,
//   handleParticipantUpdate,
//   handleMeetingEvent
// } = meetingSlice.actions;

// export default meetingSlice.reducer;




































import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from "@/hooks/use-toast";
import { requestMediaPermissions, cleanupMedia } from './mediaSlice';
import { meetingApi, MeetingRoom } from '@/services/meetingApi';
import { realTimeService } from '@/services/realTimeService';

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
  joinedAt?: string;
  isHost?: boolean;
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
  loading: boolean;
  meetingRoom: MeetingRoom | null;
  participantId: string | null;
  isHost: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'failed';
}

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
  loading: false,
  meetingRoom: null,
  participantId: null,
  isHost: false,
  connectionStatus: 'disconnected',
};

// Async thunk for creating a meeting
export const createMeeting = createAsyncThunk(
  'meeting/create',
  async (data: { name: string, hostName: string, isPublic: boolean, password?: string, maxParticipants?: number }, { rejectWithValue }) => {
    try {
      const meeting = await meetingApi.createMeeting(data);
      
      toast({
        title: "Meeting created",
        description: `Meeting "${meeting.name}" created successfully`,
        open: true,
      });
      
      return meeting;
    } catch (error) {
      console.error("Error creating meeting:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to create meeting";
      
      toast({
        title: "Failed to create meeting",
        description: errorMsg,
        variant: "destructive",
        open: true,
      });
      
      return rejectWithValue(errorMsg);
    }
  }
);

// Async thunk for joining a meeting
export const joinMeeting = createAsyncThunk(
  'meeting/join',
  async ({ meetingId, displayName, password }: { meetingId: string, displayName: string, password?: string }, { dispatch, getState, rejectWithValue }) => {
    try {
      dispatch(setConnectionStatus('connecting'));
      
      // Extract and validate meeting ID first
      const validMeetingId = meetingApi.extractMeetingId(meetingId);
      if (!validMeetingId) {
        throw new Error(`Invalid meeting ID format: ${meetingId}`);
      }
      
      // First, get meeting details using the VALIDATED meeting ID
      const meetingRoom = await meetingApi.getMeeting(validMeetingId);
      if (!meetingRoom) {
        throw new Error("Meeting not found");
      }
      
      // Check if password is required
      if (!meetingRoom.isPublic && meetingRoom.password && meetingRoom.password !== password) {
        throw new Error("Invalid password");
      }
      
      // Request media permissions first
      const stream = await dispatch(requestMediaPermissions()).unwrap();
      
      const state = getState() as { media: { video: boolean, audio: boolean } };
      const { video, audio } = state.media;
      
      // Join the meeting via API using the VALIDATED meeting ID
      const joinResult = await meetingApi.joinMeeting({
        meetingId: validMeetingId,
        participantName: displayName,
        password: password
      });
      
      if (!joinResult.success) {
        throw new Error("Failed to join meeting");
      }
      
      // Create local participant with stream
      const localParticipant: Participant = {
        id: joinResult.participantId || "local_" + Date.now(),
        name: displayName,
        isVideo: video,
        isAudio: audio,
        isSpeaking: false,
        isScreenSharing: false,
        isLocal: true,
        stream,
        joinedAt: new Date().toISOString(),
        isHost: meetingRoom.hostName === displayName
      };
      
      // Subscribe to real-time participant updates using VALIDATED meeting ID
      realTimeService.subscribe(`meeting:${validMeetingId}:participants`, (data) => {
        dispatch(handleParticipantUpdate(data));
      });
      
      // Subscribe to meeting events using VALIDATED meeting ID
      realTimeService.subscribe(`meeting:${validMeetingId}:events`, (data) => {
        dispatch(handleMeetingEvent(data));
      });
      
      // Subscribe to WebRTC signals - THIS IS KEY FOR PARTICIPANT UPDATES
      realTimeService.subscribe(`meeting:${validMeetingId}:webrtc`, (data) => {
        console.log('📨 Processing WebRTC signal in Redux:', data);
        dispatch(handleWebRTCSignal(data));
      });
      
      dispatch(setConnectionStatus('connected'));
      
      toast({
        title: "Joined meeting",
        description: `Successfully joined "${meetingRoom.name}"`,
        open: true,
      });
      
      return { 
        roomName: validMeetingId, // Store the VALID meeting ID, not the name
        displayName, 
        localParticipant, 
        meetingRoom,
        participantId: joinResult.participantId || localParticipant.id,
        isHost: meetingRoom.hostName === displayName
      };
    } catch (error) {
      console.error("Error joining meeting:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      
      dispatch(setConnectionStatus('failed'));
      
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
  async (_, { dispatch, getState }) => {
    const state = getState() as { meeting: MeetingState };
    const { roomName, participantId } = state.meeting;
    
    try {
      // Leave meeting via API
      if (roomName && participantId) {
        await meetingApi.leaveMeeting(roomName, participantId);
      }
      
      // Cleanup media resources
      await dispatch(cleanupMedia());
      
      // Unsubscribe from real-time updates
      if (roomName) {
        realTimeService.unsubscribe(`meeting:${roomName}:participants`);
        realTimeService.unsubscribe(`meeting:${roomName}:events`);
        realTimeService.unsubscribe(`meeting:${roomName}:webrtc`);
      }
      
      toast({
        title: "Meeting left",
        description: "You've left the meeting",
        open: true,
      });
      
      return null;
    } catch (error) {
      console.error("Error leaving meeting:", error);
      // Still proceed with local cleanup even if API call fails
      await dispatch(cleanupMedia());
      return null;
    }
  }
);

// Async thunk for toggling screen sharing
export const toggleScreenShare = createAsyncThunk(
  'meeting/toggleScreenShare',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { meeting: MeetingState };
    const { isScreenSharing, roomName, participantId } = state.meeting;
    
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        
        // Add event listener for when screen sharing stops
        screenStream.getTracks()[0].onended = () => {
          // This will be handled in the component to dispatch endScreenSharing
        };
        
        // Notify other participants via real-time service
        if (roomName && participantId) {
          realTimeService.send({
            type: 'screen_share_started',
            meetingId: roomName,
            participantId: participantId
          });
        }
        
        toast({
          title: "Screen sharing started",
          description: "You are now sharing your screen",
          open: true,
        });
        
        return { isScreenSharing: true, screenStream };
      } else {
        // Notify other participants via real-time service
        if (roomName && participantId) {
          realTimeService.send({
            type: 'screen_share_stopped',
            meetingId: roomName,
            participantId: participantId
          });
        }
        
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

// Async thunk for fetching participants
export const fetchParticipants = createAsyncThunk(
  'meeting/fetchParticipants',
  async (meetingId: string, { rejectWithValue }) => {
    try {
      // Validate meeting ID before fetching
      const validMeetingId = meetingApi.extractMeetingId(meetingId);
      if (!validMeetingId) {
        throw new Error(`Invalid meeting ID format: ${meetingId}`);
      }
      
      const participants = await meetingApi.getParticipants(validMeetingId);
      console.log('📋 Fetched participants from API:', participants);
      
      return participants.map((p: any) => ({
        ...p,
        isLocal: false, // All fetched participants are remote
        isSpeaking: false, // Will be updated via real-time
      }));
    } catch (error) {
      console.error("Error fetching participants:", error);
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch participants");
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
        console.log('🔄 Updating participant in Redux:', id, changes);
        state.participants[participantIndex] = {
          ...state.participants[participantIndex],
          ...changes
        };
      }
    },
    addParticipant: (state, action: PayloadAction<Participant>) => {
      const existingIndex = state.participants.findIndex(p => p.id === action.payload.id);
      if (existingIndex === -1) {
        console.log('➕ Adding participant to Redux:', action.payload);
        state.participants.push(action.payload);
      } else {
        console.log('🔄 Participant already exists, updating:', action.payload.id);
        state.participants[existingIndex] = {
          ...state.participants[existingIndex],
          ...action.payload
        };
      }
    },
    removeParticipant: (state, action: PayloadAction<string>) => {
      console.log('➖ Removing participant from Redux:', action.payload);
      state.participants = state.participants.filter(p => p.id !== action.payload);
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
      
      // Send kick event via real-time service
      if (state.roomName && state.isHost) {
        realTimeService.send({
          type: 'participant_kicked',
          meetingId: state.roomName,
          participantId: participantId
        });
      }
    },
    setConnectionStatus: (state, action: PayloadAction<MeetingState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
    },
    
    // NEW: Handle WebRTC signals specifically
    handleWebRTCSignal: (state, action: PayloadAction<any>) => {
      const signal = action.payload;
      console.log('🎯 Processing WebRTC signal in Redux:', signal);
      
      if (signal.signal && signal.signal.type === 'participant_joined') {
        const participantId = signal.signal.participantId;
        const existingParticipant = state.participants.find(p => p.id === participantId);
        
        if (!existingParticipant) {
          const newParticipant: Participant = {
            id: participantId,
            name: participantId, // You might want to get the actual name from the signal
            isVideo: false, // Will be updated when media state is received
            isAudio: false,
            isSpeaking: false,
            isScreenSharing: false,
            isLocal: participantId === state.participantId,
            joinedAt: new Date().toISOString(),
            isHost: false // Will be updated if needed
          };
          
          console.log('➕ Adding participant from WebRTC signal:', newParticipant);
          state.participants.push(newParticipant);
          
          // Show toast notification
          if (!newParticipant.isLocal) {
            toast({
              title: "Participant joined",
              description: `${participantId} joined the meeting`,
              open: true,
            });
          }
        }
      }
    },
    
    handleParticipantUpdate: (state, action: PayloadAction<any>) => {
      // Handle real-time participant updates
      const { type, participantId, data } = action.payload;
      console.log('📡 Handling participant update:', { type, participantId, data });
      
      switch (type) {
        case 'participant_joined':
          const existingParticipant = state.participants.find(p => p.id === participantId);
          if (!existingParticipant) {
            const newParticipant: Participant = {
              id: participantId,
              name: data?.name || participantId,
              isVideo: data?.isVideo || false,
              isAudio: data?.isAudio || false,
              isSpeaking: false,
              isScreenSharing: false,
              isLocal: participantId === state.participantId,
              joinedAt: new Date().toISOString(),
              isHost: data?.isHost || false
            };
            console.log('➕ Adding participant from update:', newParticipant);
            state.participants.push(newParticipant);
          }
          break;
        case 'participant_left':
          console.log('➖ Participant left via update:', participantId);
          state.participants = state.participants.filter(p => p.id !== participantId);
          break;
        case 'participant_updated':
          const participantIndex = state.participants.findIndex(p => p.id === participantId);
          if (participantIndex !== -1) {
            console.log('🔄 Updating participant via update:', participantId, data);
            state.participants[participantIndex] = {
              ...state.participants[participantIndex],
              ...data
            };
          }
          break;
      }
    },
    handleMeetingEvent: (state, action: PayloadAction<any>) => {
      // Handle real-time meeting events
      const { type, data } = action.payload;
      console.log('🎪 Handling meeting event:', { type, data });
      
      switch (type) {
        case 'meeting_ended':
          // Meeting was ended by host
          state.isMeetingJoined = false;
          state.participants = [];
          toast({
            title: "Meeting ended",
            description: "The meeting has been ended by the host",
            variant: "default",
            open: true,
          });
          break;
        case 'participant_speaking':
          const speakingParticipant = state.participants.find(p => p.id === data.participantId);
          if (speakingParticipant) {
            speakingParticipant.isSpeaking = data.isSpeaking;
          }
          break;
        case 'screen_share_started':
          const sharingParticipant = state.participants.find(p => p.id === data.participantId);
          if (sharingParticipant) {
            sharingParticipant.isScreenSharing = true;
          }
          break;
        case 'screen_share_stopped':
          const stoppedSharingParticipant = state.participants.find(p => p.id === data.participantId);
          if (stoppedSharingParticipant) {
            stoppedSharingParticipant.isScreenSharing = false;
          }
          break;
      }
    },
    
    // NEW: Set participants list (useful for bulk updates)
    setParticipants: (state, action: PayloadAction<Participant[]>) => {
      console.log('📋 Setting participants list:', action.payload);
      state.participants = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Meeting
      .addCase(createMeeting.pending, (state) => {
        state.loading = true;
        state.joiningError = null;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.meetingRoom = action.payload;
        state.isHost = true;
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.loading = false;
        state.joiningError = action.payload as string;
      })
      // Join Meeting
      .addCase(joinMeeting.pending, (state) => {
        state.loading = true;
        state.joiningError = null;
        state.connectionStatus = 'connecting';
      })
      .addCase(joinMeeting.fulfilled, (state, action) => {
        const { roomName, displayName, localParticipant, meetingRoom, participantId, isHost } = action.payload;
        state.loading = false;
        state.roomName = roomName; // This is now the validated meeting ID
        state.displayName = displayName;
        state.isMeetingJoined = true;
        state.participants = [localParticipant];
        state.joiningError = null;
        state.meetingRoom = meetingRoom;
        state.participantId = participantId;
        state.isHost = isHost;
        state.connectionStatus = 'connected';
        
        console.log('✅ Meeting joined successfully. Local participant added:', localParticipant);
      })
      .addCase(joinMeeting.rejected, (state, action) => {
        state.loading = false;
        state.joiningError = action.payload as string;
        state.isMeetingJoined = false;
        state.connectionStatus = 'failed';
      })
      // Leave Meeting
      .addCase(leaveMeeting.pending, (state) => {
        state.loading = true;
      })
      .addCase(leaveMeeting.fulfilled, (state) => {
        state.loading = false;
        state.isMeetingJoined = false;
        state.participants = [];
        state.roomName = "";
        state.displayName = "";
        state.isScreenSharing = false;
        state.meetingRoom = null;
        state.participantId = null;
        state.isHost = false;
        state.connectionStatus = 'disconnected';
      })
      // Toggle Screen Share
      .addCase(toggleScreenShare.fulfilled, (state, action) => {
        const { isScreenSharing } = action.payload;
        state.isScreenSharing = isScreenSharing;
        
        // Update the local participant's screen sharing status
        const localParticipantIndex = state.participants.findIndex(p => p.isLocal);
        if (localParticipantIndex !== -1) {
          state.participants[localParticipantIndex].isScreenSharing = isScreenSharing;
        }
      })
      // Fetch Participants
      .addCase(fetchParticipants.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchParticipants.fulfilled, (state, action) => {
        state.loading = false;
        console.log('📋 Received participants from API:', action.payload);
        
        // Merge remote participants with local participant
        const remoteParticipants = action.payload;
        const localParticipant = state.participants.find(p => p.isLocal);
        
        if (localParticipant) {
          // Keep local participant and add remote ones
          const remoteOnly = remoteParticipants.filter((remote: Participant) => remote.id !== localParticipant.id);
          state.participants = [localParticipant, ...remoteOnly];
        } else {
          state.participants = remoteParticipants;
        }
        
        console.log('📋 Updated participants list:', state.participants);
      })
      .addCase(fetchParticipants.rejected, (state, action) => {
        state.loading = false;
        console.error("Failed to fetch participants:", action.payload);
      });
  },
});

export const { 
  updateParticipant, 
  addParticipant,
  removeParticipant,
  toggleChat, 
  toggleLayout, 
  endScreenSharing, 
  clearJoiningError, 
  kickParticipant,
  setConnectionStatus,
  handleParticipantUpdate,
  handleMeetingEvent,
  handleWebRTCSignal,  // NEW: Export this action
  setParticipants       // NEW: Export this action
} = meetingSlice.actions;

export default meetingSlice.reducer;