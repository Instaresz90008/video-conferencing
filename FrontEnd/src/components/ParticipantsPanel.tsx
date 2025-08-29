
import React from 'react';
import { cn } from "@/lib/utils";
import { UserMinus, X, Crown, Mic, MicOff, Video, VideoOff, MoreVertical } from "lucide-react";
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { kickParticipant } from '@/store/meetingSlice';
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
  const { participants } = useAppSelector(state => state.meeting);
  
  const handleKickParticipant = (participantId: string, participantName: string) => {
    dispatch(kickParticipant(participantId));
    toast({
      title: "Participant removed",
      description: `${participantName} has been removed from the meeting`,
      open: true,
    });
  };
  
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
        {participants.map(participant => {
          const isHost = participant.id === "1"; // Assuming local user is always the host
          
          return (
            <div 
              key={participant.id}
              className="flex items-center justify-between p-3 hover:bg-white/5 rounded-md transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-medium">
                    {participant.name.charAt(0)}
                  </div>
                  {isHost && (
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
                      <Mic className="w-3 h-3" />
                    ) : (
                      <MicOff className="w-3 h-3" />
                    )}
                    
                    {participant.isVideo ? (
                      <Video className="w-3 h-3" />
                    ) : (
                      <VideoOff className="w-3 h-3" />
                    )}
                    
                    {participant.isSpeaking && (
                      <span className="text-green-400">Speaking</span>
                    )}
                  </div>
                </div>
              </div>
              
              {!participant.isLocal && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-black/80 text-white border-white/10">
                    <DropdownMenuItem 
                      className="text-red-400 focus:text-red-400 cursor-pointer"
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
        })}
      </div>
    </div>
  );
};

export default ParticipantsPanel;
