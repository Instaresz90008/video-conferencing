
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  // Panel states
  isParticipantsPanelOpen: boolean;
  isBackgroundSelectorOpen: boolean;
  isMomOpen: boolean;
  isSentimentOpen: boolean;
  isTimelineOpen: boolean;
  isActionItemsOpen: boolean;
  isAgendaOpen: boolean;
  isBreakoutRoomsOpen: boolean;
  isAdvancedControlsOpen: boolean;
  
  // Meeting UI states
  handRaised: boolean;
  isRecording: boolean;
  videoLayout: 'grid' | 'speaker' | 'pip' | 'pbp' | 'list';
  backgroundImage: string | null;
  
  // Emoji states
  burstEmoji: { emoji: string; key: number } | null;
  
  // Theme and visual
  theme: 'light' | 'dark' | 'system';
}

const initialState: UIState = {
  isParticipantsPanelOpen: false,
  isBackgroundSelectorOpen: false,
  isMomOpen: false,
  isSentimentOpen: false,
  isTimelineOpen: false,
  isActionItemsOpen: false,
  isAgendaOpen: false,
  isBreakoutRoomsOpen: false,
  isAdvancedControlsOpen: false,
  handRaised: false,
  isRecording: false,
  videoLayout: 'speaker',
  backgroundImage: null,
  burstEmoji: null,
  theme: 'system',
};

type PanelKeys = 'isParticipantsPanelOpen' | 'isBackgroundSelectorOpen' | 'isMomOpen' | 'isSentimentOpen' | 'isTimelineOpen' | 'isActionItemsOpen' | 'isAgendaOpen' | 'isBreakoutRoomsOpen' | 'isAdvancedControlsOpen';

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    togglePanel: (state, action: PayloadAction<PanelKeys>) => {
      const panelName = action.payload;
      state[panelName] = !state[panelName];
      
      // Close other overlapping panels for better UX
      if (state[panelName]) {
        const overlappingPanels: PanelKeys[] = [
          'isParticipantsPanelOpen', 
          'isBackgroundSelectorOpen', 
          'isMomOpen', 
          'isSentimentOpen', 
          'isTimelineOpen', 
          'isActionItemsOpen',
          'isAgendaOpen',
          'isBreakoutRoomsOpen',
          'isAdvancedControlsOpen'
        ];
        
        overlappingPanels.forEach(panel => {
          if (panel !== panelName) {
            state[panel] = false;
          }
        });
      }
    },
    closeAllPanels: (state) => {
      state.isParticipantsPanelOpen = false;
      state.isBackgroundSelectorOpen = false;
      state.isMomOpen = false;
      state.isSentimentOpen = false;
      state.isTimelineOpen = false;
      state.isActionItemsOpen = false;
      state.isAgendaOpen = false;
      state.isBreakoutRoomsOpen = false;
      state.isAdvancedControlsOpen = false;
    },
    setHandRaised: (state, action: PayloadAction<boolean>) => {
      state.handRaised = action.payload;
    },
    toggleHandRaised: (state) => {
      state.handRaised = !state.handRaised;
    },
    setRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
    toggleRecording: (state) => {
      state.isRecording = !state.isRecording;
    },
    setVideoLayout: (state, action: PayloadAction<UIState['videoLayout']>) => {
      state.videoLayout = action.payload;
    },
    setBackgroundImage: (state, action: PayloadAction<string | null>) => {
      state.backgroundImage = action.payload;
    },
    setBurstEmoji: (state, action: PayloadAction<{ emoji: string; key: number } | null>) => {
      state.burstEmoji = action.payload;
    },
    setTheme: (state, action: PayloadAction<UIState['theme']>) => {
      state.theme = action.payload;
    }
  },
});

export const { 
  togglePanel, 
  closeAllPanels,
  setHandRaised, 
  toggleHandRaised,
  setRecording, 
  toggleRecording,
  setVideoLayout,
  setBackgroundImage,
  setBurstEmoji,
  setTheme
} = uiSlice.actions;

export default uiSlice.reducer;
