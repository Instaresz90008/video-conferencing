import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  requestMediaPermissions,
  toggleVideoThunk,
  toggleAudioThunk,
  cleanupMedia,
  resetError
} from '@/store/mediaSlice';

export function useReduxMedia() {
  const dispatch = useAppDispatch();
  const { stream, video, audio, loading, error, initialized } = useAppSelector(state => state.media);

  // Request media permissions when the hook is first used
  useEffect(() => {
    // Only request media permissions if not already initialized and not currently loading
    if (!initialized && !loading && !stream) {
      console.log('Requesting media permissions...');
      dispatch(requestMediaPermissions());
    }
  }, [dispatch, initialized, loading, stream]);

  // Cleanup media when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        dispatch(cleanupMedia());
      }
    };
  }, [dispatch, stream]);

  const toggleVideo = () => {
    if (!loading) {
      dispatch(toggleVideoThunk());
    }
  };

  const toggleAudio = () => {
    if (!loading) {
      dispatch(toggleAudioThunk());
    }
  };

  // Force request permissions (useful for retry scenarios)
  const forceRequestPermissions = () => {
    return dispatch(requestMediaPermissions());
  };

  // Clear any media errors
  const clearError = () => {
    dispatch(resetError());
  };

  // Check if we have the required media tracks
  const hasVideoTrack = stream?.getVideoTracks().length > 0;
  const hasAudioTrack = stream?.getAudioTracks().length > 0;

  // Debug information
  const debugInfo = {
    hasStream: !!stream,
    hasVideoTrack,
    hasAudioTrack,
    videoEnabled: video,
    audioEnabled: audio,
    initialized,
    loading,
    error,
    streamId: stream?.id || null,
    trackCount: stream?.getTracks().length || 0
  };

  // Log debug info when there are issues
  useEffect(() => {
    if (initialized && (video || audio) && !stream) {
      console.warn('Media hook debug info:', debugInfo);
      console.warn('Expected stream but got null. Check media permissions and browser settings.');
    }
  }, [initialized, video, audio, stream]);

  return {
    stream,
    video,
    audio,
    loading,
    error,
    initialized,
    hasVideoTrack,
    hasAudioTrack,
    toggleVideo,
    toggleAudio,
    requestMediaPermissions: forceRequestPermissions,
    clearError,
    cleanup: () => dispatch(cleanupMedia()),
    debugInfo // Useful for troubleshooting
  };
}