import React, { useEffect } from 'react';
import { cn } from "@/lib/utils";
import { UserMinus, X, Crown, Mic, MicOff, Video, VideoOff, MoreVertical } from "lucide-react";
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { kickParticipant, fetchParticipants, addParticipant, updateParticipant } from '@/store/meetingSlice';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ParticipantsPanelProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({ 
  className,
  isOpen,
  onClose
}) => {
  const dispatch = useAppDispatch();
  const { participants, roomName, isHost, participantId } = useAppSelector(state => state.meeting);
  
  // Process WebRTC signals for participant management
  useEffect(() => {
    const handleWebRTCSignal = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'webrtc_signal' && data.signal) {
        console.log('🎯 Processing WebRTC signal:', data);
        
        switch (data.signal.type) {
          case 'participant_joined':
            console.log('➕ Participant joined:', data.signal.participantId);
            
            // Check if participant already exists
            const existingParticipant = participants.find(p => p.id === data.signal.participantId);
            
            if (!existingParticipant) {
              // Add new participant to Redux state
              dispatch(addParticipant({
                id: data.signal.participantId,
                name: data.signal.participantId, // Use ID as name initially
                isVideo: false,
                isAudio: false,
                isSpeaking: false,
                isScreenSharing: false,
                isHost: false,
                isLocal: data.signal.participantId === participantId,
                joinedAt: new Date().toISOString(),
                hasStream: false
              }));
              
              toast({
                title: "Participant joined",
                description: `${data.signal.participantId} joined the meeting`,
                open: true,
              });
            }
            break;
            
          case 'participant_left':
            console.log('➖ Participant left:', data.signal.participantId);
            dispatch(kickParticipant(data.signal.participantId));
            break;
            
          case 'participant_updated':
            console.log('🔄 Participant updated:', data.signal);
            dispatch(updateParticipant({
              id: data.signal.participantId,
              updates: data.signal.updates
            }));
            break;
        }
      }
    };

    // Listen for WebSocket messages (adjust this based on your WebSocket implementation)
    // You might need to access your WebSocket instance differently
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('webrtc-signal', handleWebRTCSignal);
      
      return () => {
        window.removeEventListener('webrtc-signal', handleWebRTCSignal);
      };
    }
  }, [dispatch, participants, participantId]);
  
  // Fetch participants when panel opens or meeting changes
  useEffect(() => {
    if (isOpen && roomName) {
      console.log('🔄 Fetching participants for meeting:', roomName);
      dispatch(fetchParticipants(roomName));
    }
  }, [isOpen, roomName, dispatch]);
  
  const handleKickParticipant = (targetParticipantId: string, participantName: string) => {
    if (!isHost) {
      toast({
        title: "Permission denied",
        description: "Only the host can remove participants",
        variant: "destructive",
        open: true,
      });
      return;
    }
    
    dispatch(kickParticipant(targetParticipantId));
    toast({
      title: "Participant removed",
      description: `${participantName} has been removed from the meeting`,
      open: true,
    });
  };
  
  // Debug logging
  console.log('👥 Participants Panel - Current participants:', participants);
  console.log('👑 Is host:', isHost, 'Participant ID:', participantId);
  
  return (
    <div className={cn(
      "fixed inset-y-0 right-0 w-80 bg-white/10 backdrop-blur-xl border-l border-white/20 dark:bg-black/20 dark:border-white/10 flex flex-col z-20 transition-all duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "translate-x-full",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-white/20 dark:border-white/10 flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          Participants ({participants.length})
        </h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Participants list */}
      <div className="flex-1 overflow-y-auto p-2">
        {participants.length === 0 ? (
          <div className="text-center py-8 text-white/70">
            <p>No participants found</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => roomName && dispatch(fetchParticipants(roomName))}
              className="mt-2"
            >
              Refresh
            </Button>
          </div>
        ) : (
          participants.map(participant => {
            // Fix host detection - use isHost property from participant or meeting state
            const isParticipantHost = participant.isHost || (isHost && participant.isLocal);
            
            return (
              <div 
                key={participant.id}
                className="flex items-center justify-between p-3 hover:bg-white/5 rounded-md transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-medium">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    {isParticipantHost && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">{participant.name}</span>
                      {participant.isLocal && (
                        <span className="ml-2 text-xs bg-white/20 py-0.5 px-2 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 text-xs text-white/70">
                      {participant.isAudio ? (
                        <Mic className="w-3 h-3 text-green-400" />
                      ) : (
                        <MicOff className="w-3 h-3 text-red-400" />
                      )}
                      
                      {participant.isVideo ? (
                        <Video className="w-3 h-3 text-green-400" />
                      ) : (
                        <VideoOff className="w-3 h-3 text-red-400" />
                      )}
                      
                      {participant.isSpeaking && (
                        <span className="text-green-400 animate-pulse">Speaking</span>
                      )}
                      
                      {participant.isScreenSharing && (
                        <span className="text-blue-400">Sharing</span>
                      )}
                    </div>
                    
                    {participant.joinedAt && (
                      <div className="text-xs text-white/50 mt-1">
                        Joined: {new Date(participant.joinedAt).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions for non-local participants */}
                {!participant.isLocal && isHost && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-black/80 text-white border-white/10">
                      <DropdownMenuItem 
                        className="text-red-400 focus:text-red-400 cursor-pointer hover:bg-red-500/20"
                        onClick={() => handleKickParticipant(participant.id, participant.name)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        <span>Remove from meeting</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Footer with meeting info */}
      <div className="p-4 border-t border-white/20 dark:border-white/10">
        <div className="text-sm text-white/70">
          <p>Meeting: {roomName}</p>
          {isHost && (
            <p className="text-amber-400 mt-1">You are the host</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPanel;