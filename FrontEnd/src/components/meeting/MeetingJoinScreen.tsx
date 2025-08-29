import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Users, Lock, Clock, AlertCircle, Video, VideoOff, Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { meetingApi, type MeetingRoom } from '@/services/meetingApi';
import { toast } from '@/hooks/use-toast';
import { useReduxMedia } from '@/hooks/use-redux-media';

interface MeetingJoinScreenProps {
  meeting: MeetingRoom;
  onJoinMeeting: (participantName: string) => void;
  className?: string;
}

const MeetingJoinScreen: React.FC<MeetingJoinScreenProps> = ({
  meeting,
  onJoinMeeting,
  className
}) => {
  const [participantName, setParticipantName] = useState('');
  const [password, setPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [mediaReady, setMediaReady] = useState(false);

  const { 
    stream, 
    video: isVideoEnabled, 
    audio: isAudioEnabled, 
    loading: mediaLoading,
    error: mediaError,
    toggleVideo, 
    toggleAudio 
  } = useReduxMedia();

  // Initialize media on component mount
  useEffect(() => {
    if (stream) {
      setMediaReady(true);
    }
  }, [stream]);

  const handleJoinMeeting = async () => {
    // Validation
    if (!participantName.trim()) {
      setJoinError('Please enter your name');
      return;
    }

    if (participantName.trim().length < 2) {
      setJoinError('Name must be at least 2 characters long');
      return;
    }

    if (!meeting.isPublic && !password.trim()) {
      setJoinError('This meeting requires a password');
      return;
    }

    // Check if media is ready (at least one of video/audio should work)
    if (!isVideoEnabled && !isAudioEnabled) {
      setJoinError('Please enable at least camera or microphone to join');
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    try {
      const result = await meetingApi.joinMeeting({
        meetingId: meeting.id,
        participantName: participantName.trim(),
        password: password || undefined,
      });

      if (result.success) {
        onJoinMeeting(participantName.trim());
        toast({
          title: "Joining meeting",
          description: `Welcome to ${meeting.name}`,
        });
      } else {
        setJoinError('Failed to join meeting. Please check your credentials.');
      }
    } catch (error) {
      console.error('Join meeting error:', error);
      setJoinError('Unable to join meeting. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isJoining) {
      handleJoinMeeting();
    }
  };

  // Check if meeting has expired
  const isMeetingExpired = meeting.expiresAt && new Date(meeting.expiresAt) < new Date();

  if (isMeetingExpired) {
    return (
      <div className={cn("flex items-center justify-center min-h-screen p-4", className)}>
        <Card className="w-full max-w-md bg-card text-card-foreground">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">Meeting Expired</CardTitle>
            <CardDescription>
              This meeting has expired and is no longer available
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Clock className="w-16 h-16 mx-auto text-destructive mb-4" />
            <p className="text-sm text-muted-foreground">
              Meeting expired on: {formatDate(meeting.expiresAt!)}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center min-h-screen p-4", className)}>
      <Card className="w-full max-w-md bg-card/95 backdrop-blur text-card-foreground border">
        <CardHeader className="text-center space-y-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-primary">
              {meeting.name}
            </CardTitle>
            <CardDescription>
              Hosted by {meeting.hostName}
            </CardDescription>
          </div>

          <div className="flex justify-center gap-2">
            <Badge variant={meeting.isPublic ? "default" : "secondary"}>
              {meeting.isPublic ? 'Public' : 'Private'}
              {!meeting.isPublic && <Lock className="w-3 h-3 ml-1" />}
            </Badge>
            <Badge variant="outline">
              <Users className="w-3 h-3 mr-1" />
              Max {meeting.maxParticipants}
            </Badge>
            <Badge variant="outline" className={meeting.isActive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
              {meeting.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {meeting.expiresAt && (
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Expires: {formatDate(meeting.expiresAt)}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Display */}
          {(joinError || mediaError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{joinError || mediaError}</AlertDescription>
            </Alert>
          )}

          {/* Media Loading State */}
          {mediaLoading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Setting up your camera and microphone...</AlertDescription>
            </Alert>
          )}

          {/* Form Fields */}
          <div className="space-y-2">
            <Label htmlFor="participantName">Your Name *</Label>
            <Input
              id="participantName"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-background/50 border-border"
              onKeyPress={handleKeyPress}
              disabled={isJoining}
              maxLength={50}
            />
          </div>

          {!meeting.isPublic && (
            <div className="space-y-2">
              <Label htmlFor="meetingPassword">Meeting Password *</Label>
              <Input
                id="meetingPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter meeting password"
                className="bg-background/50 border-border"
                onKeyPress={handleKeyPress}
                disabled={isJoining}
              />
            </div>
          )}

          {/* Media Preview */}
          <div className="aspect-video rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center relative border">
            {isVideoEnabled && stream && mediaReady ? (
              <video
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                ref={(video) => {
                  if (video && stream) {
                    video.srcObject = stream;
                  }
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <VideoOff className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            
            {/* Media status overlay */}
            <div className="absolute bottom-2 right-2 flex gap-1">
              <div className={cn(
                "p-1 rounded-full",
                isAudioEnabled ? "bg-green-500/80" : "bg-red-500/80"
              )}>
                {isAudioEnabled ? <Mic className="w-3 h-3 text-white" /> : <MicOff className="w-3 h-3 text-white" />}
              </div>
              <div className={cn(
                "p-1 rounded-full",
                isVideoEnabled ? "bg-green-500/80" : "bg-red-500/80"
              )}>
                {isVideoEnabled ? <Video className="w-3 h-3 text-white" /> : <VideoOff className="w-3 h-3 text-white" />}
              </div>
            </div>
          </div>

          {/* Media Controls */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "rounded-full w-12 h-12",
                isAudioEnabled ? "hover:bg-muted" : "bg-red-500/80 hover:bg-red-600 text-white"
              )}
              onClick={toggleAudio}
              disabled={mediaLoading}
            >
              {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "rounded-full w-12 h-12",
                isVideoEnabled ? "hover:bg-muted" : "bg-red-500/80 hover:bg-red-600 text-white"
              )}
              onClick={toggleVideo}
              disabled={mediaLoading}
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
          </div>

          {/* Media Status Info */}
          <div className="text-xs text-center text-muted-foreground">
            {!isVideoEnabled && !isAudioEnabled && (
              <p className="text-yellow-600 dark:text-yellow-400">⚠️ Enable at least camera or microphone to join</p>
            )}
            {(isVideoEnabled || isAudioEnabled) && (
              <p>✓ Media ready - you can join the meeting</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleJoinMeeting}
            disabled={!participantName.trim() || isJoining || (!isVideoEnabled && !isAudioEnabled) || !meeting.isActive}
          >
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Meeting'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MeetingJoinScreen;
