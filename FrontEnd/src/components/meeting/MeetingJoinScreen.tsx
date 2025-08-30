// import React, { useState, useEffect } from 'react';
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Badge } from '@/components/ui/badge';
// import { Users, Lock, Clock, AlertCircle, Video, VideoOff, Mic, MicOff, Loader2 } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { meetingApi, type MeetingRoom, type JoinMeetingRequest } from '@/services/meetingApi';
// import { toast } from '@/hooks/use-toast';
// import { useReduxMedia } from '@/hooks/use-redux-media';

// interface MeetingJoinScreenProps {
//   meeting: MeetingRoom;
//   onJoinMeeting: (participantName: string, participantId: string, token?: string) => void;
//   className?: string;
// }

// const MeetingJoinScreen: React.FC<MeetingJoinScreenProps> = ({
//   meeting,
//   onJoinMeeting,
//   className
// }) => {
//   const [participantName, setParticipantName] = useState('');
//   const [password, setPassword] = useState('');
//   const [isJoining, setIsJoining] = useState(false);
//   const [joinError, setJoinError] = useState<string | null>(null);
//   const [mediaReady, setMediaReady] = useState(false);
//   const [authChecked, setAuthChecked] = useState(false);

//   const { 
//     stream, 
//     video: isVideoEnabled, 
//     audio: isAudioEnabled, 
//     loading: mediaLoading,
//     error: mediaError,
//     toggleVideo, 
//     toggleAudio 
//   } = useReduxMedia();

//   // Check authentication on component mount
//   useEffect(() => {
//     const checkAuthentication = async () => {
//       try {
//         const isAuthenticated = await meetingApi.checkAuth();
//         if (!isAuthenticated) {
//           // Try to refresh auth if needed
//           const refreshed = await meetingApi.refreshAuthIfNeeded();
//           if (!refreshed) {
//             setJoinError('Authentication required. Please log in.');
//           }
//         }
//         setAuthChecked(true);
//       } catch (error) {
//         console.error('Auth check error:', error);
//         setAuthChecked(true);
//       }
//     };

//     checkAuthentication();
//   }, []);

//   // Initialize media on component mount
//   useEffect(() => {
//     if (stream) {
//       // Give a small delay to ensure video element is ready
//       const timer = setTimeout(() => {
//         setMediaReady(true);
//       }, 100);
//       return () => clearTimeout(timer);
//     } else {
//       setMediaReady(false);
//     }
//   }, [stream]);

//   // Subscribe to WebRTC signals
//   useEffect(() => {
//     if (meeting?.id) {
//       meetingApi.subscribeToSignals(meeting.id, (signal) => {
//         console.log('Received WebRTC signal:', signal);
//         // Handle incoming WebRTC signals here
//       });
//     }
//   }, [meeting?.id]);

//   const handleJoinMeeting = async () => {
//     // Clear previous errors
//     setJoinError(null);

//     // Validation
//     if (!participantName.trim()) {
//       setJoinError('Please enter your name');
//       return;
//     }

//     if (participantName.trim().length < 2) {
//       setJoinError('Name must be at least 2 characters long');
//       return;
//     }

//     if (participantName.trim().length > 50) {
//       setJoinError('Name must be 50 characters or less');
//       return;
//     }

//     if (!meeting.isPublic && !password.trim()) {
//       setJoinError('This meeting requires a password');
//       return;
//     }

//     // Check if media is ready (at least one of video/audio should work)
//     if (!isVideoEnabled && !isAudioEnabled) {
//       setJoinError('Please enable at least camera or microphone to join');
//       return;
//     }

//     // Check if meeting is active
//     if (!meeting.isActive) {
//       setJoinError('This meeting is not currently active');
//       return;
//     }

//     setIsJoining(true);

//     try {
//       const joinRequest: JoinMeetingRequest = {
//         meetingId: meeting.id,
//         participantName: participantName.trim(),
//         password: password || undefined,
//       };

//       const result = await meetingApi.joinMeeting(joinRequest);

//       if (result.success) {
//         // Successfully joined
//         onJoinMeeting(
//           participantName.trim(), 
//           result.participantId || '', 
//           result.token
//         );
        
//         toast({
//           title: "Successfully joined",
//           description: `Welcome to ${meeting.name}`,
//         });
//       } else {
//         setJoinError('Failed to join meeting. Please check your credentials and try again.');
//       }
//     } catch (error: any) {
//       console.error('Join meeting error:', error);
      
//       // More specific error handling
//       if (error.message.includes('password')) {
//         setJoinError('Incorrect password. Please try again.');
//       } else if (error.message.includes('full') || error.message.includes('capacity')) {
//         setJoinError('Meeting is at full capacity. Please try again later.');
//       } else if (error.message.includes('expired')) {
//         setJoinError('This meeting has expired.');
//       } else if (error.message.includes('authentication') || error.message.includes('auth')) {
//         setJoinError('Authentication required. Please log in and try again.');
//       } else {
//         setJoinError('Unable to join meeting. Please check your connection and try again.');
//       }
//     } finally {
//       setIsJoining(false);
//     }
//   };

//   const formatDate = (dateString: string) => {
//     try {
//       return new Date(dateString).toLocaleString(undefined, {
//         weekday: 'short',
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch (error) {
//       return dateString;
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !isJoining && authChecked) {
//       handleJoinMeeting();
//     }
//   };

//   // Check if meeting has expired
//   const isMeetingExpired = meeting.expiresAt && new Date(meeting.expiresAt) < new Date();

//   // Generate meeting link for sharing
//   const meetingLink = meetingApi.generateMeetingLink(meeting.id);

//   if (isMeetingExpired) {
//     return (
//       <div className={cn("flex items-center justify-center min-h-screen p-4", className)}>
//         <Card className="w-full max-w-md bg-card text-card-foreground">
//           <CardHeader className="text-center">
//             <CardTitle className="text-2xl font-bold text-destructive">Meeting Expired</CardTitle>
//             <CardDescription>
//               This meeting has expired and is no longer available
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="text-center">
//             <Clock className="w-16 h-16 mx-auto text-destructive mb-4" />
//             <p className="text-sm text-muted-foreground">
//               Meeting expired on: {formatDate(meeting.expiresAt!)}
//             </p>
//             <div className="mt-4 p-3 bg-muted/50 rounded-lg">
//               <p className="text-xs text-muted-foreground">
//                 Meeting Link: <code className="text-xs bg-background px-1 rounded">{meetingLink}</code>
//               </p>
//             </div>
//           </CardContent>
//           <CardFooter>
//             <Button 
//               className="w-full"
//               onClick={() => window.location.href = '/dashboard'}
//             >
//               Go to Dashboard
//             </Button>
//           </CardFooter>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className={cn("flex items-center justify-center min-h-screen p-4", className)}>
//       <Card className="w-full max-w-md bg-card/95 backdrop-blur text-card-foreground border">
//         <CardHeader className="text-center space-y-4">
//           <div className="space-y-2">
//             <CardTitle className="text-2xl font-bold text-primary">
//               {meeting.name}
//             </CardTitle>
//             <CardDescription>
//               Hosted by {meeting.hostName}
//             </CardDescription>
//           </div>

//           <div className="flex justify-center gap-2 flex-wrap">
//             <Badge variant={meeting.isPublic ? "default" : "secondary"}>
//               {meeting.isPublic ? 'Public' : 'Private'}
//               {!meeting.isPublic && <Lock className="w-3 h-3 ml-1" />}
//             </Badge>
//             <Badge variant="outline">
//               <Users className="w-3 h-3 mr-1" />
//               Max {meeting.maxParticipants}
//             </Badge>
//             <Badge variant="outline" className={meeting.isActive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
//               {meeting.isActive ? 'Active' : 'Inactive'}
//             </Badge>
//           </div>

//           {meeting.expiresAt && (
//             <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
//               <Clock className="w-3 h-3" />
//               Expires: {formatDate(meeting.expiresAt)}
//             </div>
//           )}

//           {/* Meeting Link */}
//           <div className="text-xs text-muted-foreground">
//             <p className="mb-1">Meeting ID: <code className="bg-muted px-1 rounded">{meeting.id}</code></p>
//           </div>
//         </CardHeader>

//         <CardContent className="space-y-4">
//           {/* Auth Check Loading */}
//           {!authChecked && (
//             <Alert>
//               <Loader2 className="h-4 w-4 animate-spin" />
//               <AlertDescription>Checking authentication...</AlertDescription>
//             </Alert>
//           )}

//           {/* Error Display */}
//           {(joinError || mediaError) && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{joinError || mediaError}</AlertDescription>
//             </Alert>
//           )}

//           {/* Media Loading State */}
//           {mediaLoading && (
//             <Alert>
//               <Loader2 className="h-4 w-4 animate-spin" />
//               <AlertDescription>Setting up your camera and microphone...</AlertDescription>
//             </Alert>
//           )}

//           {/* Form Fields */}
//           <div className="space-y-2">
//             <Label htmlFor="participantName">Your Name *</Label>
//             <Input
//               id="participantName"
//               value={participantName}
//               onChange={(e) => setParticipantName(e.target.value)}
//               placeholder="Enter your full name"
//               className="bg-background/50 border-border"
//               onKeyPress={handleKeyPress}
//               disabled={isJoining || !authChecked}
//               maxLength={50}
//               autoComplete="name"
//             />
//             <div className="text-xs text-muted-foreground">
//               {participantName.length}/50 characters
//             </div>
//           </div>

//           {!meeting.isPublic && (
//             <div className="space-y-2">
//               <Label htmlFor="meetingPassword">Meeting Password *</Label>
//               <Input
//                 id="meetingPassword"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter meeting password"
//                 className="bg-background/50 border-border"
//                 onKeyPress={handleKeyPress}
//                 disabled={isJoining || !authChecked}
//                 autoComplete="current-password"
//               />
//             </div>
//           )}

//           {/* Media Preview */}
//           <div className="aspect-video rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center relative border">
//             {stream ? (
//               <>
//                 <video
//                   autoPlay
//                   playsInline
//                   muted
//                   className="w-full h-full object-cover"
//                   ref={(video) => {
//                     if (video && stream) {
//                       video.srcObject = stream;
//                       video.onloadedmetadata = () => {
//                         setMediaReady(true);
//                         console.log('Video metadata loaded, stream ready');
//                       };
//                       video.oncanplay = () => {
//                         console.log('Video can play');
//                       };
//                       video.onerror = (e) => {
//                         console.error('Video element error:', e);
//                       };
//                     }
//                   }}
//                 />
//                 {!isVideoEnabled && (
//                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//                     <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
//                       <VideoOff className="w-12 h-12 text-white" />
//                     </div>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
//                 <VideoOff className="w-12 h-12 text-muted-foreground" />
//                 <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
//                   {mediaLoading ? 'Loading camera...' : 'No camera access'}
//                 </div>
//               </div>
//             )}
            
//             {/* Media status overlay */}
//             <div className="absolute bottom-2 right-2 flex gap-1">
//               <div className={cn(
//                 "p-1 rounded-full",
//                 isAudioEnabled ? "bg-green-500/80" : "bg-red-500/80"
//               )}>
//                 {isAudioEnabled ? <Mic className="w-3 h-3 text-white" /> : <MicOff className="w-3 h-3 text-white" />}
//               </div>
//               <div className={cn(
//                 "p-1 rounded-full",
//                 isVideoEnabled ? "bg-green-500/80" : "bg-red-500/80"
//               )}>
//                 {isVideoEnabled ? <Video className="w-3 h-3 text-white" /> : <VideoOff className="w-3 h-3 text-white" />}
//               </div>
//             </div>
//           </div>

//           {/* Media Controls */}
//           <div className="flex justify-center space-x-4">
//             <Button
//               variant="outline"
//               size="icon"
//               className={cn(
//                 "rounded-full w-12 h-12",
//                 isAudioEnabled ? "hover:bg-muted" : "bg-red-500/80 hover:bg-red-600 text-white"
//               )}
//               onClick={toggleAudio}
//               disabled={mediaLoading || !authChecked}
//               title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
//             >
//               {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
//             </Button>
            
//             <Button
//               variant="outline"
//               size="icon"
//               className={cn(
//                 "rounded-full w-12 h-12",
//                 isVideoEnabled ? "hover:bg-muted" : "bg-red-500/80 hover:bg-red-600 text-white"
//               )}
//               onClick={toggleVideo}
//               disabled={mediaLoading || !authChecked}
//               title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
//             >
//               {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
//             </Button>
//           </div>

//           {/* Media Status Info */}
//           <div className="text-xs text-center text-muted-foreground">
//             {!isVideoEnabled && !isAudioEnabled && (
//               <p className="text-yellow-600 dark:text-yellow-400">⚠️ Enable at least camera or microphone to join</p>
//             )}
//             {stream && isVideoEnabled && (
//               <p className="text-green-600 dark:text-green-400">✓ Camera ready - video preview should be visible</p>
//             )}
//             {stream && !isVideoEnabled && isAudioEnabled && (
//               <p className="text-green-600 dark:text-green-400">✓ Microphone ready - camera disabled</p>
//             )}
//             {!stream && isVideoEnabled && !mediaLoading && (
//               <p className="text-red-600 dark:text-red-400">❌ Camera enabled but no video stream - check permissions</p>
//             )}
//             {!stream && isAudioEnabled && !mediaLoading && (
//               <p className="text-orange-600 dark:text-orange-400">⚠️ Audio enabled but no stream detected</p>
//             )}
//             {mediaLoading && (
//               <p className="text-blue-600 dark:text-blue-400">⏳ Setting up media devices...</p>
//             )}
//             {!stream && !mediaLoading && (isVideoEnabled || isAudioEnabled) && (
//               <p className="text-red-600 dark:text-red-400">❌ Media setup failed - please check browser permissions</p>
//             )}
//           </div>

//           {/* Meeting Status Warnings */}
//           {!meeting.isActive && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>
//                 This meeting is currently inactive and cannot be joined.
//               </AlertDescription>
//             </Alert>
//           )}
//         </CardContent>

//         <CardFooter className="flex flex-col space-y-2">
//           <Button 
//             className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
//             onClick={handleJoinMeeting}
//             disabled={
//               !participantName.trim() || 
//               isJoining || 
//               (!isVideoEnabled && !isAudioEnabled) || 
//               !meeting.isActive ||
//               !authChecked ||
//               !mediaReady
//             }
//           >
//             {isJoining ? (
//               <>
//                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                 Joining...
//               </>
//             ) : (
//               'Join Meeting'
//             )}
//           </Button>

//           {/* Additional Info */}
//           <div className="text-xs text-center text-muted-foreground space-y-1">
//             <p>Created: {formatDate(meeting.createdAt)}</p>
//             {meeting.expiresAt && (
//               <p>
//                 Time remaining: {new Date(meeting.expiresAt).getTime() > Date.now() 
//                   ? `${Math.ceil((new Date(meeting.expiresAt).getTime() - Date.now()) / (1000 * 60))} minutes`
//                   : 'Expired'
//                 }
//               </p>
//             )}
//           </div>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// };

// export default MeetingJoinScreen;

































import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Users, Lock, Clock, AlertCircle, Video, VideoOff, Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { meetingApi, type MeetingRoom, type JoinMeetingRequest } from '@/services/meetingApi';
import { toast } from '@/hooks/use-toast';
import { useReduxMedia } from '@/hooks/use-redux-media';

interface MeetingJoinScreenProps {
  meeting: MeetingRoom;
  onJoinMeeting: (participantName: string, participantId: string, token?: string) => void;
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

  const { 
    stream, 
    video: isVideoEnabled, 
    audio: isAudioEnabled, 
    loading: mediaLoading,
    error: mediaError,
    toggleVideo, 
    toggleAudio 
  } = useReduxMedia();

  const handleJoinMeeting = async () => {
    setJoinError(null);

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

    if (!meeting.isActive) {
      setJoinError('This meeting is not currently active');
      return;
    }

    setIsJoining(true);

    try {
      const joinRequest: JoinMeetingRequest = {
        meetingId: meeting.id,
        participantName: participantName.trim(),
        password: password || undefined,
      };

      const result = await meetingApi.joinMeeting(joinRequest);

      if (result.success) {
        onJoinMeeting(
          participantName.trim(), 
          result.participantId || '', 
          result.token
        );
        
        toast({
          title: "Successfully joined",
          description: `Welcome to ${meeting.name}`,
        });
      } else {
        setJoinError('Failed to join meeting. Please try again.');
      }
    } catch (error: any) {
      console.error('Join meeting error:', error);
      
      if (error.message.includes('password')) {
        setJoinError('Incorrect password. Please try again.');
      } else if (error.message.includes('full') || error.message.includes('capacity')) {
        setJoinError('Meeting is at full capacity. Please try again later.');
      } else if (error.message.includes('expired')) {
        setJoinError('This meeting has expired.');
      } else {
        setJoinError('Unable to join meeting. Please check your connection and try again.');
      }
    } finally {
      setIsJoining(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isJoining) {
      handleJoinMeeting();
    }
  };

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

          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant={meeting.isPublic ? "default" : "secondary"}>
              {meeting.isPublic ? 'Public Meeting' : 'Private Meeting'}
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

          <div className="text-xs text-muted-foreground">
            <p className="mb-1">Meeting ID: <code className="bg-muted px-1 rounded">{meeting.id}</code></p>
            <p className="text-green-600 dark:text-green-400">✓ Anyone can join this meeting</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {(joinError || mediaError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{joinError || mediaError}</AlertDescription>
            </Alert>
          )}

          {mediaLoading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Setting up your camera and microphone...</AlertDescription>
            </Alert>
          )}

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
              autoComplete="name"
            />
            <div className="text-xs text-muted-foreground">
              {participantName.length}/50 characters
            </div>
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
                autoComplete="current-password"
              />
            </div>
          )}

          {/* Media Preview */}
          <div className="aspect-video rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center relative border">
            {stream ? (
              <>
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
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                      <VideoOff className="w-12 h-12 text-white" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <VideoOff className="w-12 h-12 text-muted-foreground" />
                <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
                  {mediaLoading ? 'Loading camera...' : 'No camera access'}
                </div>
              </div>
            )}
            
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
              title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
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
              title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
          </div>

          {!meeting.isActive && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This meeting is currently inactive and cannot be joined.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleJoinMeeting}
            disabled={
              !participantName.trim() || 
              isJoining || 
              !meeting.isActive
            }
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

          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>Created: {formatDate(meeting.createdAt)}</p>
            {meeting.expiresAt && (
              <p>
                Time remaining: {new Date(meeting.expiresAt).getTime() > Date.now() 
                  ? `${Math.ceil((new Date(meeting.expiresAt).getTime() - Date.now()) / (1000 * 60))} minutes`
                  : 'Expired'
                }
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MeetingJoinScreen;