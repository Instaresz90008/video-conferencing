import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from "@/hooks/use-toast";

export interface MediaState {
  stream: MediaStream | null;
  video: boolean;
  audio: boolean;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

const initialState: MediaState = {
  stream: null,
  video: true,
  audio: true,
  loading: false,
  initialized: false,
  error: null,
};

// Async thunk for requesting media permissions
export const requestMediaPermissions = createAsyncThunk(
  'media/requestPermissions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { media: MediaState };
      let { video, audio } = state.media;
      
      // Try to get the requested permissions
      // If both are false, try audio-only as fallback
      if (!video && !audio) {
        console.log("Attempting audio-only fallback...");
        audio = true;
      }

      // First try with the user's current preferences
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: video,
          audio: audio,
        });
        
        toast({
          title: "Media connected",
          description: `${video ? 'Camera' : ''}${video && audio ? ' and ' : ''}${audio ? 'microphone' : ''} ready`,
        });
        
        return stream;
      } catch (initialError) {
        console.log("Initial attempt failed, trying fallbacks...");
        
        // Try audio-only fallback if video failed
        if (video && audio) {
          try {
            const audioStream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true,
            });
            
            toast({
              title: "Audio connected",
              description: "Microphone ready (camera access denied)",
              variant: "default",
            });
            
            return audioStream;
          } catch (audioError) {
            throw initialError; // Use the original error
          }
        }
        
        throw initialError;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      let errorMsg = "Failed to access camera/microphone";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMsg = "Permission denied. Please allow camera and microphone access in your browser.";
        } else if (error.name === 'NotFoundError') {
          errorMsg = "No camera or microphone found. Please connect a device.";
        } else if (error.name === 'NotReadableError') {
          errorMsg = "Camera or microphone is being used by another application.";
        } else {
          errorMsg = error.message;
        }
      }
      
      return rejectWithValue(errorMsg);
    }
  }
);

// Async thunk for toggling video
export const toggleVideoThunk = createAsyncThunk(
  'media/toggleVideo',
  async (_, { getState, dispatch }) => {
    const state = getState() as { media: MediaState };
    const { stream, video } = state.media;
    const newVideoState = !video;
    
    // Toggle existing tracks if stream exists
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach(track => {
          track.enabled = newVideoState;
        });
        return { newVideoState, streamChanged: false };
      }
    }
    
    // If we need to enable video but don't have video tracks, request new permissions
    if (newVideoState) {
      try {
        // Stop current stream first to avoid conflicts
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        await dispatch(requestMediaPermissions()).unwrap();
        return { newVideoState, streamChanged: true };
      } catch (error) {
        console.error("Failed to get video stream:", error);
        return { newVideoState: false, streamChanged: false };
      }
    }
    
    return { newVideoState, streamChanged: false };
  }
);

// Async thunk for toggling audio
export const toggleAudioThunk = createAsyncThunk(
  'media/toggleAudio',
  async (_, { getState, dispatch }) => {
    const state = getState() as { media: MediaState };
    const { stream, audio } = state.media;
    const newAudioState = !audio;
    
    // Toggle existing tracks if stream exists
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach(track => {
          track.enabled = newAudioState;
        });
        return { newAudioState, streamChanged: false };
      }
    }
    
    // If we need to enable audio but don't have audio tracks, request new permissions
    if (newAudioState) {
      try {
        // Stop current stream first to avoid conflicts
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        await dispatch(requestMediaPermissions()).unwrap();
        return { newAudioState, streamChanged: true };
      } catch (error) {
        console.error("Failed to get audio stream:", error);
        return { newAudioState: false, streamChanged: false };
      }
    }
    
    return { newAudioState, streamChanged: false };
  }
);

// Cleanup media resources
export const cleanupMedia = createAsyncThunk(
  'media/cleanup',
  async (_, { getState }) => {
    const state = getState() as { media: MediaState };
    const { stream } = state.media;
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }
  }
);

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    setVideoEnabled: (state, action: PayloadAction<boolean>) => {
      state.video = action.payload;
    },
    setAudioEnabled: (state, action: PayloadAction<boolean>) => {
      state.audio = action.payload;
    },
    resetError: (state) => {
      state.error = null;
    },
    // Add a reducer to manually set initialization state
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestMediaPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestMediaPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.stream = action.payload;
        state.error = null;
      })
      .addCase(requestMediaPermissions.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload as string;
      })
      .addCase(toggleVideoThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleVideoThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.video = action.payload.newVideoState;
        // If stream changed, the new stream will be set by requestMediaPermissions
      })
      .addCase(toggleVideoThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to toggle video';
      })
      .addCase(toggleAudioThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleAudioThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.audio = action.payload.newAudioState;
        // If stream changed, the new stream will be set by requestMediaPermissions
      })
      .addCase(toggleAudioThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to toggle audio';
      })
      .addCase(cleanupMedia.fulfilled, (state) => {
        state.stream = null;
        state.initialized = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { 
  setVideoEnabled, 
  setAudioEnabled, 
  resetError, 
  setInitialized 
} = mediaSlice.actions;

export default mediaSlice.reducer;







// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { toast } from "@/hooks/use-toast";

// export interface MediaState {
//   hasStream: boolean;
//   streamId: string | null;
//   video: boolean;
//   audio: boolean;
//   loading: boolean;
//   initialized: boolean;
//   error: string | null;
// }

// const initialState: MediaState = {
//   hasStream: false,
//   streamId: null,
//   video: true,
//   audio: true,
//   loading: false,
//   initialized: false,
//   error: null,
// };

// // Store streams outside Redux to avoid serialization issues
// class MediaStreamManager {
//   private streams = new Map<string, MediaStream>();
  
//   store(stream: MediaStream): string {
//     const id = crypto.randomUUID();
//     this.streams.set(id, stream);
//     return id;
//   }
  
//   get(id: string): MediaStream | null {
//     return this.streams.get(id) || null;
//   }
  
//   remove(id: string): void {
//     const stream = this.streams.get(id);
//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//       this.streams.delete(id);
//     }
//   }
  
//   cleanup(): void {
//     this.streams.forEach((stream, id) => {
//       stream.getTracks().forEach(track => track.stop());
//     });
//     this.streams.clear();
//   }
// }

// const mediaStreamManager = new MediaStreamManager();

// // Async thunk for requesting media permissions
// export const requestMediaPermissions = createAsyncThunk(
//   'media/requestPermissions',
//   async (_, { getState, rejectWithValue }) => {
//     try {
//       const state = getState() as { media: MediaState };
//       let { video, audio } = state.media;
      
//       // Try to get the requested permissions
//       // If both are false, try audio-only as fallback
//       if (!video && !audio) {
//         console.log("Attempting audio-only fallback...");
//         audio = true;
//       }

//       // First try with the user's current preferences
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: video,
//           audio: audio,
//         });
        
//         toast({
//           title: "Media connected",
//           description: `${video ? 'Camera' : ''}${video && audio ? ' and ' : ''}${audio ? 'microphone' : ''} ready`,
//         });
        
//         // Store stream and return its ID
//         const streamId = mediaStreamManager.store(stream);
//         return { streamId, hasStream: true };
//       } catch (initialError) {
//         console.log("Initial attempt failed, trying fallbacks...");
        
//         // Try audio-only fallback if video failed
//         if (video && audio) {
//           try {
//             const audioStream = await navigator.mediaDevices.getUserMedia({
//               video: false,
//               audio: true,
//             });
            
//             toast({
//               title: "Audio connected",
//               description: "Microphone ready (camera access denied)",
//               variant: "default",
//             });
            
//             // Store stream and return its ID
//             const streamId = mediaStreamManager.store(audioStream);
//             return { streamId, hasStream: true };
//           } catch (audioError) {
//             throw initialError; // Use the original error
//           }
//         }
        
//         throw initialError;
//       }
//     } catch (error) {
//       console.error("Error accessing media devices:", error);
//       let errorMsg = "Failed to access camera/microphone";
      
//       if (error instanceof Error) {
//         if (error.name === 'NotAllowedError') {
//           errorMsg = "Permission denied. Please allow camera and microphone access in your browser.";
//         } else if (error.name === 'NotFoundError') {
//           errorMsg = "No camera or microphone found. Please connect a device.";
//         } else if (error.name === 'NotReadableError') {
//           errorMsg = "Camera or microphone is being used by another application.";
//         } else {
//           errorMsg = error.message;
//         }
//       }
      
//       return rejectWithValue(errorMsg);
//     }
//   }
// );

// // Async thunk for toggling video
// export const toggleVideoThunk = createAsyncThunk(
//   'media/toggleVideo',
//   async (_, { getState, dispatch }) => {
//     const state = getState() as { media: MediaState };
//     const { streamId, video } = state.media;
//     const newVideoState = !video;
    
//     // Toggle existing tracks if stream exists
//     if (streamId) {
//       const stream = mediaStreamManager.get(streamId);
//       if (stream) {
//         const videoTracks = stream.getVideoTracks();
//         if (videoTracks.length > 0) {
//           videoTracks.forEach(track => {
//             track.enabled = newVideoState;
//           });
//           return { newVideoState, streamChanged: false };
//         }
//       }
//     }
    
//     // If we need to enable video but don't have video tracks, request new permissions
//     if (newVideoState) {
//       try {
//         // Cleanup current stream first
//         if (streamId) {
//           mediaStreamManager.remove(streamId);
//         }
        
//         await dispatch(requestMediaPermissions()).unwrap();
//         return { newVideoState, streamChanged: true };
//       } catch (error) {
//         console.error("Failed to get video stream:", error);
//         return { newVideoState: false, streamChanged: false };
//       }
//     }
    
//     return { newVideoState, streamChanged: false };
//   }
// );

// // Async thunk for toggling audio
// export const toggleAudioThunk = createAsyncThunk(
//   'media/toggleAudio',
//   async (_, { getState, dispatch }) => {
//     const state = getState() as { media: MediaState };
//     const { streamId, audio } = state.media;
//     const newAudioState = !audio;
    
//     // Toggle existing tracks if stream exists
//     if (streamId) {
//       const stream = mediaStreamManager.get(streamId);
//       if (stream) {
//         const audioTracks = stream.getAudioTracks();
//         if (audioTracks.length > 0) {
//           audioTracks.forEach(track => {
//             track.enabled = newAudioState;
//           });
//           return { newAudioState, streamChanged: false };
//         }
//       }
//     }
    
//     // If we need to enable audio but don't have audio tracks, request new permissions
//     if (newAudioState) {
//       try {
//         // Cleanup current stream first
//         if (streamId) {
//           mediaStreamManager.remove(streamId);
//         }
        
//         await dispatch(requestMediaPermissions()).unwrap();
//         return { newAudioState, streamChanged: true };
//       } catch (error) {
//         console.error("Failed to get audio stream:", error);
//         return { newAudioState: false, streamChanged: false };
//       }
//     }
    
//     return { newAudioState, streamChanged: false };
//   }
// );

// // Cleanup media resources
// export const cleanupMedia = createAsyncThunk(
//   'media/cleanup',
//   async (_, { getState }) => {
//     const state = getState() as { media: MediaState };
//     const { streamId } = state.media;
    
//     if (streamId) {
//       mediaStreamManager.remove(streamId);
//     }
//   }
// );

// const mediaSlice = createSlice({
//   name: 'media',
//   initialState,
//   reducers: {
//     setVideoEnabled: (state, action: PayloadAction<boolean>) => {
//       state.video = action.payload;
//     },
//     setAudioEnabled: (state, action: PayloadAction<boolean>) => {
//       state.audio = action.payload;
//     },
//     resetError: (state) => {
//       state.error = null;
//     },
//     // Add a reducer to manually set initialization state
//     setInitialized: (state, action: PayloadAction<boolean>) => {
//       state.initialized = action.payload;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(requestMediaPermissions.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(requestMediaPermissions.fulfilled, (state, action) => {
//         state.loading = false;
//         state.initialized = true;
//         state.hasStream = action.payload.hasStream;
//         state.streamId = action.payload.streamId;
//         state.error = null;
//       })
//       .addCase(requestMediaPermissions.rejected, (state, action) => {
//         state.loading = false;
//         state.initialized = true;
//         state.error = action.payload as string;
//       })
//       .addCase(toggleVideoThunk.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(toggleVideoThunk.fulfilled, (state, action) => {
//         state.loading = false;
//         state.video = action.payload.newVideoState;
//         // If stream changed, the new stream will be set by requestMediaPermissions
//       })
//       .addCase(toggleVideoThunk.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message || 'Failed to toggle video';
//       })
//       .addCase(toggleAudioThunk.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(toggleAudioThunk.fulfilled, (state, action) => {
//         state.loading = false;
//         state.audio = action.payload.newAudioState;
//         // If stream changed, the new stream will be set by requestMediaPermissions
//       })
//       .addCase(toggleAudioThunk.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message || 'Failed to toggle audio';
//       })
//       .addCase(cleanupMedia.fulfilled, (state) => {
//         state.hasStream = false;
//         state.streamId = null;
//         state.initialized = false;
//         state.loading = false;
//         state.error = null;
//       });
//   },
// });

// export const { 
//   setVideoEnabled, 
//   setAudioEnabled, 
//   resetError, 
//   setInitialized 
// } = mediaSlice.actions;

// export { mediaStreamManager };
// export default mediaSlice.reducer;