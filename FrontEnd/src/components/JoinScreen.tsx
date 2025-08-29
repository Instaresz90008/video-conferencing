
import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Video, VideoOff, Mic, MicOff, User } from "lucide-react";
import { useReduxMedia } from '@/hooks/use-redux-media';
import { useAppDispatch } from '@/store/hooks';
import { joinMeeting } from '@/store/meetingSlice';
import MediaPermissionFallback from './MediaPermissionFallback';

interface JoinScreenProps {
  className?: string;
  onJoinMeeting: (displayName: string, roomName: string) => void;
}

const JoinScreen: React.FC<JoinScreenProps> = ({ 
  className,
  onJoinMeeting
}) => {
  const [displayName, setDisplayName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [showPermissionError, setShowPermissionError] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const dispatch = useAppDispatch();
  
  const { 
    stream, 
    video: isVideoEnabled, 
    audio: isAudioEnabled, 
    toggleVideo, 
    toggleAudio,
    requestMediaPermissions,
    error: mediaError
  } = useReduxMedia();
  
  // Connect stream to video preview
  useEffect(() => {
    if (stream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = stream;
    }
  }, [stream]);
  
  // Show permission error if there's a media error
  useEffect(() => {
    if (mediaError) {
      setShowPermissionError(true);
    } else {
      setShowPermissionError(false);
    }
  }, [mediaError]);
  
  const handleJoin = () => {
    if (!displayName.trim() || !roomName.trim()) return;
    
    setIsJoining(true);
    
    // Dispatch the join meeting action
    dispatch(joinMeeting({ roomName, displayName }))
      .unwrap()
      .then(() => {
        onJoinMeeting(displayName, roomName);
      })
      .catch((error) => {
        console.error("Failed to join meeting:", error);
        setShowPermissionError(true);
      })
      .finally(() => {
        setIsJoining(false);
      });
  };
  
  const handleRetryPermissions = () => {
    setShowPermissionError(false);
    requestMediaPermissions();
  };
  
  return (
    <Card className={cn(
      "w-full max-w-md glass-card text-white overflow-hidden animate-fade-in",
      className
    )}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-gradient">Join Meeting</CardTitle>
        <CardDescription className="text-white/70 text-center">
          Enter your details to join the video conference
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Name input */}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="displayName">
            Your Name
          </label>
          <Input
            id="displayName"
            placeholder="Enter your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
        
        {/* Room name input */}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="roomName">
            Room Name or URL
          </label>
          <Input
            id="roomName"
            placeholder="Enter room name or meeting link"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
        
        {/* Preview or Error Message */}
        {showPermissionError ? (
          <MediaPermissionFallback 
            error={mediaError}
            onRetry={handleRetryPermissions}
          />
        ) : (
          <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-r from-brand-blue/30 to-brand-purple/30 flex items-center justify-center">
            {isVideoEnabled && stream ? (
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-12 h-12 text-white/70" />
              </div>
            )}
          </div>
        )}
        
        {/* Audio/Video controls */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-full",
              isAudioEnabled ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80 hover:bg-red-600"
            )}
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-full",
              isVideoEnabled ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80 hover:bg-red-600"
            )}
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white"
          onClick={handleJoin}
          disabled={!displayName.trim() || !roomName.trim() || isJoining}
        >
          {isJoining ? "Joining..." : "Join Meeting"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JoinScreen;
