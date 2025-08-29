import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { 
  Video, VideoOff, Mic, MicOff, MessageCircle,
  Users, UserPlus, Phone, Settings, ScreenShare, ScreenShareOff,
  MoreHorizontal, Share2, PictureInPicture, PictureInPicture2,
  Image
} from "lucide-react";
// Replace Record with a valid icon - using a circle icon as replacement
import { CircleOff } from "lucide-react"; // Import for recording functionality
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { leaveMeeting, toggleScreenShare } from '@/store/meetingSlice';
import { toggleVideoThunk, toggleAudioThunk } from '@/store/mediaSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ControlBarProps {
  className?: string;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onToggleParticipants: () => void;
  isParticipantsPanelOpen: boolean;
  onOpenBackgroundSelector: () => void;
  onToggleAgenda?: () => void;
  onToggleBreakoutRooms?: () => void;
  onToggleAdvancedControls?: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({ 
  className,
  onToggleChat,
  isChatOpen,
  onToggleParticipants,
  isParticipantsPanelOpen,
  onOpenBackgroundSelector,
  onToggleAgenda,
  onToggleBreakoutRooms,
  onToggleAdvancedControls
}) => {
  const dispatch = useAppDispatch();
  const { participants, isScreenSharing } = useAppSelector(state => state.meeting);
  const { video: isVideoOn, audio: isAudioOn } = useAppSelector(state => state.media);
  const [tooltips, setTooltips] = useState<{[key: string]: boolean}>({});
  const [isRecording, setIsRecording] = useState(false);
  
  // Handle control actions
  const handleToggleVideo = () => {
    dispatch(toggleVideoThunk());
  };
  
  const handleToggleAudio = () => {
    dispatch(toggleAudioThunk());
  };
  
  const handleToggleScreenShare = () => {
    dispatch(toggleScreenShare());
  };
  
  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    // This would typically interact with a recording API
  };
  
  const handleLeaveMeeting = () => {
    dispatch(leaveMeeting());
  };
  
  const showTooltip = (id: string) => {
    setTooltips(prev => ({...prev, [id]: true}));
  };
  
  const hideTooltip = (id: string) => {
    setTooltips(prev => ({...prev, [id]: false}));
  };
  
  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-black/40 backdrop-blur-xl border-t border-white/10 z-50",
      className
    )}>
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all hover:scale-105"
              onMouseEnter={() => showTooltip('settings')}
              onMouseLeave={() => hideTooltip('settings')}
            >
              <Settings className="w-5 h-5" />
              <span className="sr-only">Settings</span>
              {tooltips['settings'] && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Settings
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-black/80 backdrop-blur-xl border-white/10 text-white">
            <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10">
              <Settings className="mr-2 h-4 w-4" />
              <span>Meeting Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10" onClick={onOpenBackgroundSelector}>
              <Image className="mr-2 h-4 w-4" />
              <span>Change Background</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10">
              <Share2 className="mr-2 h-4 w-4" />
              <span>Invite Others</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all hover:scale-105"
              onMouseEnter={() => showTooltip('layout')}
              onMouseLeave={() => hideTooltip('layout')}
            >
              <PictureInPicture className="w-5 h-5" />
              <span className="sr-only">Layout</span>
              {tooltips['layout'] && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Layout Options
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto bg-black/80 backdrop-blur-xl border-white/10 text-white p-2">
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex justify-start bg-transparent border-white/10 hover:bg-white/10"
              >
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
                Grid View
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex justify-start bg-transparent border-white/10 hover:bg-white/10"
              >
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                List View
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex justify-start bg-transparent border-white/10 hover:bg-white/10"
              >
                <PictureInPicture className="mr-2 h-4 w-4" />
                Picture in Picture
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex justify-start bg-transparent border-white/10 hover:bg-white/10"
              >
                <PictureInPicture2 className="mr-2 h-4 w-4" />
                Side by Side
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          variant="outline" 
          size="icon" 
          className={cn(
            "rounded-full transition-all duration-200 group",
            isAudioOn ? 
              "bg-white/10 border-white/10 hover:bg-white/20" : 
              "bg-red-500/80 text-white hover:bg-red-600/80 border-transparent"
          )}
          onClick={handleToggleAudio}
          onMouseEnter={() => showTooltip('audio')}
          onMouseLeave={() => hideTooltip('audio')}
        >
          {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          {tooltips['audio'] && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {isAudioOn ? 'Mute Audio' : 'Unmute Audio'}
            </div>
          )}
          <span className="absolute bottom-0 left-0 right-0 h-1 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center rounded-b-full"></span>
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className={cn(
            "rounded-full transition-all duration-200 group",
            isVideoOn ? 
              "bg-white/10 border-white/10 hover:bg-white/20" : 
              "bg-red-500/80 text-white hover:bg-red-600/80 border-transparent"
          )}
          onClick={handleToggleVideo}
          onMouseEnter={() => showTooltip('video')}
          onMouseLeave={() => hideTooltip('video')}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          {tooltips['video'] && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {isVideoOn ? 'Stop Video' : 'Start Video'}
            </div>
          )}
          <span className="absolute bottom-0 left-0 right-0 h-1 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center rounded-b-full"></span>
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className={cn(
            "rounded-full transition-all duration-200 group",
            isScreenSharing ? 
              "bg-brand-purple/80 text-white hover:bg-brand-purple border-transparent" : 
              "bg-white/10 border-white/10 hover:bg-white/20"
          )}
          onClick={handleToggleScreenShare}
          onMouseEnter={() => showTooltip('screen')}
          onMouseLeave={() => hideTooltip('screen')}
        >
          {isScreenSharing ? <ScreenShareOff className="w-5 h-5" /> : <ScreenShare className="w-5 h-5" />}
          {tooltips['screen'] && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
            </div>
          )}
          <span className="absolute bottom-0 left-0 right-0 h-1 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center rounded-b-full"></span>
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className={cn(
            "rounded-full transition-all duration-200 group",
            isRecording ? 
              "bg-red-500 text-white hover:bg-red-600 border-transparent" : 
              "bg-white/10 border-white/10 hover:bg-white/20"
          )}
          onClick={handleToggleRecording}
          onMouseEnter={() => showTooltip('record')}
          onMouseLeave={() => hideTooltip('record')}
        >
          <CircleOff className="w-5 h-5" />
          {tooltips['record'] && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </div>
          )}
          <span className="absolute bottom-0 left-0 right-0 h-1 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center rounded-b-full"></span>
        </Button>
        
        <Button 
          variant="destructive" 
          size="icon" 
          className="rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200 hover:scale-105"
          onClick={handleLeaveMeeting}
          onMouseEnter={() => showTooltip('leave')}
          onMouseLeave={() => hideTooltip('leave')}
        >
          <Phone className="w-5 h-5 rotate-[135deg]" />
          {tooltips['leave'] && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Leave Meeting
            </div>
          )}
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="icon"
          className={cn(
            "bg-white/10 border-white/10 hover:bg-white/20 transition-all duration-200",
            isChatOpen && "bg-brand-blue/30 hover:bg-brand-blue/40"
          )}
          onClick={onToggleChat}
          onMouseEnter={() => showTooltip('chat')}
          onMouseLeave={() => hideTooltip('chat')}
        >
          <MessageCircle className="w-5 h-5" />
          {tooltips['chat'] && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {isChatOpen ? 'Close Chat' : 'Open Chat'}
            </div>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          size="icon"
          className={cn(
            "bg-white/10 border-white/10 hover:bg-white/20 transition-all duration-200",
            isParticipantsPanelOpen && "bg-brand-blue/30 hover:bg-brand-blue/40"
          )}
          onClick={onToggleParticipants}
          onMouseEnter={() => showTooltip('participants')}
          onMouseLeave={() => hideTooltip('participants')}
        >
          <Users className="w-5 h-5" />
          {tooltips['participants'] && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Participants ({participants.length})
            </div>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          size="icon"
          className="bg-white/10 border-white/10 hover:bg-white/20 transition-all duration-200"
          onMouseEnter={() => showTooltip('invite')}
          onMouseLeave={() => hideTooltip('invite')}
        >
          <UserPlus className="w-5 h-5" />
          {tooltips['invite'] && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Invite Others
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ControlBar;
