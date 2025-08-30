import React, { useEffect } from 'react';
import { cn } from "@/lib/utils";
import { UserMinus, X, Crown, Mic, MicOff, Video, VideoOff, MoreVertical } from "lucide-react";
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { kickParticipantAction, fetchParticipants, addParticipant, updateParticipant, handleParticipantUpdate } from '@/store/meetingSlice';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { realTimeService } from '@/services/realTimeService';

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
  
  // Subscribe to real-time participant updates
  useEffect(() => {
    if (!roomName) return;

    const handleParticipantUpdates = (data: any) => {
      console.log('Real-time participant update received:', data);
      dispatch(handleParticipantUpdate(data));
    };

    // Subscribe to participant events
    realTimeService.subscribe(`meeting:${roomName}:participants`, handleParticipantUpdates);

    return () => {
      // Cleanup subscription when component unmounts or roomName changes
      realTimeService.unsubscribe(`meeting:${roomName}:participants`, handleParticipantUpdates);
    };
  }, [roomName, dispatch]);
  
  // Fetch participants when panel opens or meeting changes
  useEffect(() => {
    if (isOpen && roomName) {
      console.log('Fetching participants for meeting:', roomName);
      dispatch(fetchParticipants(roomName));
    }
  }, [isOpen, roomName, dispatch]);
  
  const handleKickParticipant = async (targetParticipantId: string, participantName: string) => {
    if (!isHost) {
      toast({
        title: "Permission denied",
        description: "Only the host can remove participants",
        variant: "destructive",
      });
      return;
    }

    if (targetParticipantId === participantId) {
      toast({
        title: "Cannot remove yourself",
        description: "You cannot remove yourself from the meeting",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await dispatch(kickParticipantAction(targetParticipantId)).unwrap();
      
      toast({
        title: "Participant removed",
        description: `${participantName} has been removed from the meeting`,
      });
    } catch (error) {
      console.error('Failed to kick participant:', error);
      toast({
        title: "Failed to remove participant",
        description: "An error occurred while removing the participant",
        variant: "destructive",
      });
    }
  };
  
  // Sort participants to show host first, then local user, then others
  const sortedParticipants = [...participants].sort((a, b) => {
    // Host first
    if (a.isHost && !b.isHost) return -1;
    if (!a.isHost && b.isHost) return 1;
    
    // Then local user
    if (a.isLocal && !b.isLocal) return -1;
    if (!a.isLocal && b.isLocal) return 1;
    
    // Then alphabetically by name
    return (a.name || '').localeCompare(b.name || '');
  });
  
  console.log('Participants Panel - Current participants:', sortedParticipants);
  console.log('Is host:', isHost, 'Participant ID:', participantId);
  
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
          sortedParticipants.map(participant => {
            // Use the participant's isHost property directly from backend
            const isParticipantHost = participant.isHost || false;
            
            // Safe name handling with fallbacks
            const displayName = participant.name || participant.id || 'Unknown User';
            const avatarLetter = displayName.charAt(0).toUpperCase();
            
            // Check if this participant can be kicked (not self, not if user isn't host)
            const canKick = isHost && !participant.isLocal && participant.id !== participantId;
            
            return (
              <div 
                key={participant.id}
                className="flex items-center justify-between p-3 hover:bg-white/5 rounded-md transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-medium">
                      {avatarLetter}
                    </div>
                    {isParticipantHost && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="font-medium truncate">{displayName}</span>
                      {participant.isLocal && (
                        <span className="ml-2 text-xs bg-white/20 py-0.5 px-2 rounded-full flex-shrink-0">
                          You
                        </span>
                      )}
                      {isParticipantHost && (
                        <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 py-0.5 px-2 rounded-full flex-shrink-0">
                          Host
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 text-xs text-white/70 mt-1">
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
                
                {/* Actions for participants that can be managed */}
                {canKick && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-black/80 text-white border-white/10">
                      <DropdownMenuItem 
                        className="text-red-400 focus:text-red-400 cursor-pointer hover:bg-red-500/20"
                        onClick={() => handleKickParticipant(participant.id, displayName)}
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
            <div className="flex items-center mt-1 text-amber-400">
              <Crown className="w-3 h-3 mr-1" />
              <span>You are the host</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPanel;