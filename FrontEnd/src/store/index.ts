
import { configureStore } from '@reduxjs/toolkit';
import meetingReducer from './meetingSlice';
import mediaReducer from './mediaSlice';
import chatReducer from './chatSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    meeting: meetingReducer,
    media: mediaReducer,
    chat: chatReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['media.stream', 'meeting.participants.stream', 'chat.messages.timestamp'],
      }
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
