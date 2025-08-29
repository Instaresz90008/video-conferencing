
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  requestMediaPermissions,
  toggleVideoThunk,
  toggleAudioThunk,
  cleanupMedia
} from '@/store/mediaSlice';

export function useReduxMedia() {
  const dispatch = useAppDispatch();
  const { stream, video, audio, loading, error } = useAppSelector(state => state.media);
  const [initialized, setInitialized] = useState(false);

  // Request media permissions when the hook is initialized
  useEffect(() => {
    // Only request media permissions once
    if (!initialized) {
      dispatch(requestMediaPermissions()).then(() => {
        setInitialized(true);
      });
    }
    
    return () => {
      dispatch(cleanupMedia());
    };
  }, [dispatch, initialized]);

  const toggleVideo = () => {
    dispatch(toggleVideoThunk());
  };

  const toggleAudio = () => {
    dispatch(toggleAudioThunk());
  };

  // Force request permissions if not initialized and no stream
  const forceRequestPermissions = () => {
    return dispatch(requestMediaPermissions());
  };

  return {
    stream,
    video,
    audio,
    loading,
    error,
    initialized,
    toggleVideo,
    toggleAudio,
    requestMediaPermissions: forceRequestPermissions,
    cleanup: () => dispatch(cleanupMedia())
  };
}
