
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from "@/hooks/use-toast";

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: string; // Changed from Date to string for serialization
  type: 'text' | 'code' | 'attachment' | 'system';
  code?: {
    language: string;
    content: string;
  };
  attachment?: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
  mentions?: string[];
}

export interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isFullScreen: boolean;
  searchQuery: string;
  filteredMessages: ChatMessage[];
  typingUsers: string[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [
    {
      id: '1',
      text: 'Welcome to the meeting chat!',
      sender: 'System',
      timestamp: new Date().toISOString(),
      type: 'system'
    }
  ],
  isOpen: false,
  isFullScreen: false,
  searchQuery: '',
  filteredMessages: [],
  typingUsers: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Async thunk for sending messages
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message: Omit<ChatMessage, 'id' | 'timestamp'>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { meeting: { displayName: string } };
      
      if (!message.text.trim() && !message.code && !message.attachment) {
        return rejectWithValue('Message cannot be empty');
      }

      const newMessage: ChatMessage = {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        sender: message.sender || state.meeting.displayName || 'Anonymous'
      };

      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      return rejectWithValue('Failed to send message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
      if (state.isOpen) {
        state.unreadCount = 0;
      }
    },
    toggleFullScreen: (state) => {
      state.isFullScreen = !state.isFullScreen;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      if (action.payload.trim()) {
        state.filteredMessages = state.messages.filter(msg =>
          msg.text.toLowerCase().includes(action.payload.toLowerCase()) ||
          msg.sender.toLowerCase().includes(action.payload.toLowerCase())
        );
      } else {
        state.filteredMessages = [];
      }
    },
    addTypingUser: (state, action: PayloadAction<string>) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser: (state, action: PayloadAction<string>) => {
      state.typingUsers = state.typingUsers.filter(user => user !== action.payload);
    },
    markMessagesAsRead: (state) => {
      state.unreadCount = 0;
    },
    clearChat: (state) => {
      state.messages = state.messages.filter(msg => msg.type === 'system');
      state.filteredMessages = [];
      state.searchQuery = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
        if (!state.isOpen) {
          state.unreadCount += 1;
        }
        
        // Update filtered messages if search is active
        if (state.searchQuery.trim()) {
          const query = state.searchQuery.toLowerCase();
          if (action.payload.text.toLowerCase().includes(query) ||
              action.payload.sender.toLowerCase().includes(query)) {
            state.filteredMessages.push(action.payload);
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        
        toast({
          title: "Failed to send message",
          description: action.payload as string,
          variant: "destructive",
        });
      });
  },
});

export const { 
  toggleChat, 
  toggleFullScreen, 
  setSearchQuery, 
  addTypingUser, 
  removeTypingUser, 
  markMessagesAsRead,
  clearChat 
} = chatSlice.actions;

export default chatSlice.reducer;
