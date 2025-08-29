
// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Video, Users, Clock, Copy } from 'lucide-react';
// import { meetingApi } from '@/services/meetingApi';
// import { toast } from '@/hooks/use-toast';
// import { useNavigate } from 'react-router-dom';

// const QuickMeetingCreator = () => {
//   const [isCreating, setIsCreating] = useState(false);
//   const [meetingName, setMeetingName] = useState('');
//   const [hostName, setHostName] = useState('');
//   const navigate = useNavigate();

//   const createAndJoinMeeting = async () => {
//     if (!meetingName.trim() || !hostName.trim()) {
//       toast({
//         title: "Missing Information",
//         description: "Please provide meeting name and your name",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsCreating(true);
//     try {
//       const meeting = await meetingApi.mockCreateMeeting({
//         name: meetingName,
//         hostName,
//         isPublic: true,
//         maxParticipants: 50,
//         duration: 60
//       });

//       toast({
//         title: "Meeting Created",
//         description: `Meeting "${meeting.name}" created successfully`,
//       });

//       // Navigate to the meeting
//       navigate(`/meeting/${meeting.id}`);
//     } catch (error) {
//       console.error('Error creating meeting:', error);
//       toast({
//         title: "Creation Failed",
//         description: "Failed to create meeting. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   const createInstantMeeting = async () => {
//     const defaultName = `Quick Meeting ${new Date().toLocaleDateString()}`;
//     const defaultHost = 'Host';
    
//     setIsCreating(true);
//     try {
//       const meeting = await meetingApi.mockCreateMeeting({
//         name: defaultName,
//         hostName: defaultHost,
//         isPublic: true,
//         maxParticipants: 50,
//         duration: 60
//       });

//       const meetingLink = meetingApi.generateMeetingLink(meeting.id);
      
//       // Copy to clipboard
//       await navigator.clipboard.writeText(meetingLink);
      
//       toast({
//         title: "Instant Meeting Created",
//         description: "Meeting link copied to clipboard",
//       });

//       // Navigate to the meeting
//       navigate(`/meeting/${meeting.id}`);
//     } catch (error) {
//       console.error('Error creating instant meeting:', error);
//       toast({
//         title: "Creation Failed",
//         description: "Failed to create instant meeting",
//         variant: "destructive",
//       });
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   return (
//     <Card className="glass-card">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Video className="w-5 h-5" />
//           Quick Meeting
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-3">
//             <Input
//               placeholder="Meeting name"
//               value={meetingName}
//               onChange={(e) => setMeetingName(e.target.value)}
//               className="bg-white/10 border-white/20"
//             />
//             <Input
//               placeholder="Your name"
//               value={hostName}
//               onChange={(e) => setHostName(e.target.value)}
//               className="bg-white/10 border-white/20"
//             />
//             <Button 
//               onClick={createAndJoinMeeting}
//               disabled={isCreating}
//               className="w-full"
//             >
//               <Users className="w-4 h-4 mr-2" />
//               {isCreating ? "Creating..." : "Create & Join"}
//             </Button>
//           </div>
          
//           <div className="flex flex-col justify-center">
//             <Button 
//               onClick={createInstantMeeting}
//               disabled={isCreating}
//               variant="outline"
//               className="h-20 bg-white/5 hover:bg-white/10"
//             >
//               <div className="text-center">
//                 <Clock className="w-6 h-6 mx-auto mb-2" />
//                 <div>Instant Meeting</div>
//                 <div className="text-xs opacity-70">Start now</div>
//               </div>
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default QuickMeetingCreator;




























import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Video, Users, Clock, Copy, AlertCircle } from 'lucide-react';
import { meetingApi } from '@/services/meetingApi';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const QuickMeetingCreator = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [meetingName, setMeetingName] = useState('');
  const [hostName, setHostName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const authStatus = await meetingApi.checkAuth();
      setIsAuthenticated(authStatus);
      
      if (!authStatus) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create meetings",
          variant: "destructive",
        });
      }
    };

    checkAuthStatus();
  }, []);

  const createAndJoinMeeting = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create meetings",
        variant: "destructive",
      });
      return;
    }

    if (!meetingName.trim() || !hostName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide meeting name and your name",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const meeting = await meetingApi.createMeeting({
        name: meetingName,
        hostName,
        isPublic: true,
        maxParticipants: 50,
        duration: 60
      });

      toast({
        title: "Meeting Created",
        description: `Meeting "${meeting.name}" created successfully`,
      });

      // Navigate to the meeting
      navigate(`/meeting/${meeting.id}`);
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const createInstantMeeting = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create meetings",
        variant: "destructive",
      });
      return;
    }

    const defaultName = `Quick Meeting ${new Date().toLocaleDateString()}`;
    const defaultHost = 'Host';
    
    setIsCreating(true);
    try {
      const meeting = await meetingApi.createMeeting({
        name: defaultName,
        hostName: defaultHost,
        isPublic: true,
        maxParticipants: 50,
        duration: 60
      });

      const meetingLink = meetingApi.generateMeetingLink(meeting.id);
      
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(meetingLink);
        toast({
          title: "Instant Meeting Created",
          description: "Meeting link copied to clipboard",
        });
      } catch (clipboardError) {
        // Fallback if clipboard API fails
        toast({
          title: "Instant Meeting Created",
          description: `Meeting created: ${meeting.name}`,
        });
      }

      // Navigate to the meeting
      navigate(`/meeting/${meeting.id}`);
    } catch (error) {
      console.error('Error creating instant meeting:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create instant meeting",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm opacity-70">Checking authentication...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Quick Meeting
          {!isAuthenticated && (
            <AlertCircle className="w-4 h-4 text-orange-400" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAuthenticated && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-orange-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              Authentication required to create meetings
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Input
              placeholder="Meeting name"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              className="bg-white/10 border-white/20"
              disabled={!isAuthenticated}
            />
            <Input
              placeholder="Your name"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              className="bg-white/10 border-white/20"
              disabled={!isAuthenticated}
            />
            <Button 
              onClick={createAndJoinMeeting}
              disabled={isCreating || !isAuthenticated}
              className="w-full"
            >
              <Users className="w-4 h-4 mr-2" />
              {isCreating ? "Creating..." : "Create & Join"}
            </Button>
          </div>
          
          <div className="flex flex-col justify-center">
            <Button 
              onClick={createInstantMeeting}
              disabled={isCreating || !isAuthenticated}
              variant="outline"
              className="h-20 bg-white/5 hover:bg-white/10"
            >
              <div className="text-center">
                <Clock className="w-6 h-6 mx-auto mb-2" />
                <div>Instant Meeting</div>
                <div className="text-xs opacity-70">Start now</div>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickMeetingCreator;