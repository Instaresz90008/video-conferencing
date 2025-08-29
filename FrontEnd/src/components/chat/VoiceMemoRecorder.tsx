
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Play, Pause, Square, Trash2, Send } from 'lucide-react';
import { chatAPI } from '@/services/chatApi';
import { VoiceMemo } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceMemoRecorderProps {
  onVoiceMemoCreated: (voiceMemo: VoiceMemo) => void;
  maxDuration?: number;
}

const VoiceMemoRecorder: React.FC<VoiceMemoRecorderProps> = ({
  onVoiceMemoCreated,
  maxDuration = 300
}) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setDuration(0);

      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      animateWaveform();

      toast({
        title: t('recordingStarted'),
        description: "Voice memo recording in progress...",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: t('errorMicrophoneAccess'),
        variant: "destructive",
      });
    }
  };

  const animateWaveform = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const waveform = Array.from(dataArray.slice(0, 50)).map(value => value / 255);
    setWaveformData(waveform);

    if (isRecording && !isPaused) {
      animationRef.current = requestAnimationFrame(animateWaveform);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      animateWaveform();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  };

  const playAudio = () => {
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    audioRef.current = new Audio(audioUrl);
    audioRef.current.play();
    setIsPlaying(true);

    audioRef.current.onended = () => {
      setIsPlaying(false);
    };
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setWaveformData([]);
    audioChunksRef.current = [];
  };

  const sendVoiceMemo = async () => {
    if (!audioBlob) return;

    try {
      setIsUploading(true);
      const voiceMemo = await chatAPI.uploadVoiceMemo(audioBlob);
      onVoiceMemoCreated(voiceMemo);
      deleteRecording();
      
      toast({
        title: t('voiceMemoSent'),
        description: "Your voice message has been shared",
      });
    } catch (error) {
      console.error('Error uploading voice memo:', error);
      toast({
        title: "Upload failed",
        description: t('errorVoiceUpload'),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 border rounded-lg bg-muted/20 dark:bg-gray-800/30 dark:border-gray-700">
      <div className="space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                variant="outline"
                size="sm"
                className={cn(
                  "bg-red-500/10 hover:bg-red-500/20 border-red-500/20",
                  "dark:bg-red-500/20 dark:hover:bg-red-500/30 dark:border-red-500/30",
                  "focus-ring"
                )}
                aria-label={t('record')}
              >
                <Mic className="w-4 h-4 mr-2" />
                {t('record')}
              </Button>
            )}

            {isRecording && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  variant="outline"
                  size="sm"
                  className="focus-ring dark:border-gray-600 dark:hover:bg-gray-700"
                  aria-label={isPaused ? "Resume recording" : "Pause recording"}
                >
                  {isPaused ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={stopRecording}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "bg-red-500/10 hover:bg-red-500/20",
                    "dark:bg-red-500/20 dark:hover:bg-red-500/30",
                    "focus-ring"
                  )}
                  aria-label="Stop recording"
                >
                  <Square className="w-4 h-4" />
                </Button>
              </div>
            )}

            {audioBlob && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={isPlaying ? pauseAudio : playAudio}
                  variant="outline"
                  size="sm"
                  className="focus-ring dark:border-gray-600 dark:hover:bg-gray-700"
                  aria-label={isPlaying ? "Pause playback" : "Play recording"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={deleteRecording}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "text-red-500 hover:bg-red-500/10",
                    "dark:text-red-400 dark:hover:bg-red-500/20",
                    "focus-ring"
                  )}
                  aria-label={t('delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={sendVoiceMemo}
                  disabled={isUploading}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 focus-ring"
                  aria-label={t('send')}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isUploading ? 'Sending...' : t('send')}
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-200">
              {formatDuration(duration)}
            </Badge>
            {isRecording && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
            )}
          </div>
        </div>

        {/* Duration Progress Bar */}
        {(isRecording || audioBlob) && (
          <div className="space-y-2">
            <Progress 
              value={(duration / maxDuration) * 100} 
              className="h-2"
              aria-label={`Recording progress: ${duration} of ${maxDuration} seconds`}
            />
            <div className="text-xs text-muted-foreground text-center">
              {formatDuration(maxDuration - duration)} remaining
            </div>
          </div>
        )}

        {/* Waveform Visualization */}
        {(isRecording || audioBlob) && (
          <div className="flex items-center justify-center h-16 bg-muted/30 dark:bg-gray-700/30 rounded">
            <div className="flex items-end gap-1 h-12" aria-label="Audio waveform visualization">
              {(waveformData.length > 0 ? waveformData : Array(50).fill(0.1)).map((amplitude, index) => (
                <div
                  key={index}
                  className={cn(
                    "bg-primary rounded-t transition-all duration-100",
                    isRecording ? "opacity-80" : "opacity-50"
                  )}
                  style={{
                    width: '2px',
                    height: `${Math.max(amplitude * 100, 4)}%`,
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceMemoRecorder;
