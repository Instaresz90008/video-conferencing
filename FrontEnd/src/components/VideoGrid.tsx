
import React, { useEffect, useRef, useState } from 'react';
import { cn } from "@/lib/utils";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useAppSelector } from '@/store/hooks';
import { Participant } from '@/store/meetingSlice';
import ParticipantAvatar from './video/ParticipantAvatar';

interface VideoGridProps {
  className?: string;
  layout?: 'grid' | 'speaker' | 'pip' | 'pbp' | 'list';
  background?: string | null;
  onLayoutChange?: (layout: 'grid' | 'speaker' | 'pip' | 'pbp' | 'list') => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({ 
  className,
  layout = 'speaker',
  background,
  onLayoutChange
}) => {
  const { participants = [] } = useAppSelector(state => state.meeting);
  const { stream } = useAppSelector(state => state.media);
  const [activeLayout, setActiveLayout] = useState(layout);
  
  // Sanity check for participants
  const validParticipants = participants.filter(p => p && p.id && p.name);
  
  // Update local participant with current media stream
  const updatedParticipants = validParticipants.map(participant => {
    if (participant.isLocal && stream) {
      return { ...participant, stream };
    }
    return participant;
  });
  
  // Find speaking participant with fallback
  const speakingParticipant = updatedParticipants.find(p => p.isSpeaking) || 
                             updatedParticipants.find(p => p.isLocal) || 
                             updatedParticipants[0];
  
  const changeLayout = (newLayout: 'grid' | 'speaker' | 'pip' | 'pbp' | 'list') => {
    setActiveLayout(newLayout);
    onLayoutChange?.(newLayout);
  };
  
  useEffect(() => {
    if (layout) {
      setActiveLayout(layout);
    }
  }, [layout]);

  // Early return if no participants
  if (!updatedParticipants.length) {
    return (
      <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
        <div className="text-center text-white/60">
          <div className="text-xl mb-2">No participants</div>
          <div className="text-sm">Waiting for participants to join...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Grid Layout */}
      {activeLayout === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 h-full">
          {updatedParticipants.map(participant => (
            <ParticipantTile key={participant.id} participant={participant} />
          ))}
        </div>
      )}
      
      {/* List Layout */}
      {activeLayout === 'list' && (
        <div className="flex flex-col gap-2 p-3 h-full overflow-y-auto">
          {updatedParticipants.map(participant => (
            <ParticipantTile 
              key={participant.id} 
              participant={participant} 
              className="h-24 w-full flex-shrink-0" 
              mini 
            />
          ))}
        </div>
      )}
      
      {/* Speaker Layout */}
      {activeLayout === 'speaker' && speakingParticipant && (
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <ParticipantTile 
              participant={speakingParticipant} 
              className="h-full rounded-none" 
              fullScreen 
            />
          </div>
          {/* Thumbnail strip */}
          {updatedParticipants.length > 1 && (
            <div className="absolute top-2 right-2 left-2 h-20 flex gap-2 overflow-x-auto px-2 py-1">
              {updatedParticipants
                .filter(p => p.id !== speakingParticipant.id)
                .map(participant => (
                  <ParticipantTile 
                    key={participant.id} 
                    participant={participant} 
                    className="h-full w-28 flex-shrink-0 shadow-lg border border-white/20"
                    mini 
                  />
                ))}
            </div>
          )}
        </div>
      )}
      
      {/* Picture in Picture Layout */}
      {activeLayout === 'pip' && speakingParticipant && (
        <div className="relative h-full">
          <ParticipantTile 
            participant={speakingParticipant} 
            className="h-full rounded-none" 
            fullScreen 
          />
          
          {updatedParticipants.length > 1 && (
            <div className="absolute bottom-24 right-4 w-48 h-36 shadow-lg border-2 border-white/30 rounded-lg overflow-hidden z-20">
              <ParticipantTile 
                participant={updatedParticipants.find(p => p.id !== speakingParticipant.id) || updatedParticipants[0]} 
                className="h-full w-full" 
                pip
              />
            </div>
          )}
        </div>
      )}
      
      {/* Side by Side Layout */}
      {activeLayout === 'pbp' && (
        <div className="flex h-full">
          <div className="flex-1 border-r border-white/20">
            {updatedParticipants[0] && (
              <ParticipantTile 
                participant={updatedParticipants[0]} 
                className="h-full rounded-none" 
                fullScreen 
              />
            )}
          </div>
          <div className="flex-1">
            {updatedParticipants[1] && (
              <ParticipantTile 
                participant={updatedParticipants[1]} 
                className="h-full rounded-none" 
                fullScreen 
              />
            )}
          </div>
        </div>
      )}
      
      {/* Layout Controls */}
      <div className="absolute top-4 right-4 bg-black/40 dark:bg-black/60 backdrop-blur-md p-2 rounded-full transition-all z-10 border border-white/20 flex gap-1">
        {[
          { layout: 'grid', icon: 'grid', title: 'Grid View' },
          { layout: 'list', icon: 'list', title: 'List View' },
          { layout: 'speaker', icon: 'speaker', title: 'Speaker View' },
          { layout: 'pip', icon: 'pip', title: 'Picture in Picture' },
          { layout: 'pbp', icon: 'pbp', title: 'Side by Side' }
        ].map(({ layout: layoutType, title }) => (
          <button 
            key={layoutType}
            onClick={() => changeLayout(layoutType as any)}
            className={cn(
              "p-1.5 rounded-full transition-all",
              activeLayout === layoutType ? 'bg-brand-blue text-white' : 'hover:bg-white/10'
            )}
            title={title}
          >
            <LayoutIcon type={layoutType} />
          </button>
        ))}
      </div>
    </div>
  );
};

// Layout icon component
const LayoutIcon = ({ type }: { type: string }) => {
  const iconProps = { width: 16, height: 16, fill: "none", stroke: "currentColor", strokeWidth: 2 };
  
  switch (type) {
    case 'grid':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      );
    case 'list':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      );
    case 'speaker':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case 'pip':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
          <path d="M10 6h4v4h-4z"/>
        </svg>
      );
    case 'pbp':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect x="1" y="4" width="10" height="16" rx="2" />
          <rect x="13" y="4" width="10" height="16" rx="2" />
        </svg>
      );
    default:
      return null;
  }
};

// Participant tile component
interface ParticipantTileProps {
  participant: Participant;
  className?: string;
  mini?: boolean;
  fullScreen?: boolean;
  pip?: boolean;
}

const ParticipantTile: React.FC<ParticipantTileProps> = ({ 
  participant, 
  className,
  mini = false,
  fullScreen = false,
  pip = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  // Sanity check for participant
  if (!participant || !participant.id || !participant.name) {
    return null;
  }
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (participant.stream && videoElement && participant.isVideo) {
      try {
        console.log(`Setting video stream for ${participant.name}:`, participant.stream);
        videoElement.srcObject = participant.stream;
        setVideoError(false);
        
        videoElement.onloadedmetadata = () => {
          console.log(`Video loaded for ${participant.name}`);
          videoElement.play().catch(err => {
            console.error(`Error playing video for ${participant.name}:`, err);
            setVideoError(true);
          });
        };
        
        videoElement.onerror = (err) => {
          console.error(`Video error for ${participant.name}:`, err);
          setVideoError(true);
        };
      } catch (error) {
        console.error(`Error setting video stream for ${participant.name}:`, error);
        setVideoError(true);
      }
    }
  }, [participant.stream, participant.isVideo, participant.name]);
  
  return (
    <div 
      className={cn(
        "relative rounded-2xl overflow-hidden transition-all glass-morphism group",
        participant.isSpeaking && "ring-2 ring-brand-blue animate-pulse-subtle",
        participant.isLocal && !fullScreen && "ring-1 ring-brand-teal",
        fullScreen && "rounded-none",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Video or avatar display */}
      {participant.isVideo && !videoError ? (
        <div className={cn(
          "absolute inset-0",
          fullScreen ? "bg-black" : "bg-gradient-to-b from-brand-blue/20 to-brand-purple/20"
        )}>
          {participant.stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={participant.isLocal}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ParticipantAvatar 
                name={participant.name} 
                size={fullScreen ? "xl" : "lg"}
                showInitials
                isOnline={true}
              />
            </div>
          )}
        </div>
      ) : (
        <div className={cn(
          "w-full h-full flex items-center justify-center",
          fullScreen ? "bg-black" : "bg-gradient-to-r from-brand-blue/30 to-brand-purple/30"
        )}>
          <ParticipantAvatar 
            name={participant.name} 
            size={fullScreen ? "xl" : "lg"}
            showInitials
            isOnline={true}
          />
        </div>
      )}
      
      {/* Participant info overlay */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-3 bg-black/40 backdrop-blur-sm flex items-center justify-between text-white transition-all duration-300",
        mini ? "opacity-100 text-xs py-1.5" : (isHovering || !participant.isVideo) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <div className="flex items-center min-w-0 flex-1">
          <ParticipantAvatar 
            name={participant.name} 
            size="sm"
            className="mr-2 flex-shrink-0"
          />
          <span className="font-medium truncate">
            {participant.name} {participant.isLocal && "(You)"}
          </span>
        </div>
        
        <div className="flex space-x-1 flex-shrink-0">
          {participant.isAudio ? 
            <Mic className="w-4 h-4" /> : 
            <MicOff className="w-4 h-4 text-red-400" />
          }
          {participant.isVideo ? 
            <Video className="w-4 h-4" /> : 
            <VideoOff className="w-4 h-4 text-red-400" />
          }
        </div>
      </div>
      
      {/* Speaking indicator */}
      {participant.isSpeaking && (
        <div className="absolute bottom-2 left-2 flex items-center space-x-1 px-1.5 py-0.5 bg-green-500/30 backdrop-blur-md rounded-full animate-pulse-subtle">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          {!mini && <span className="text-xs text-white">Speaking</span>}
        </div>
      )}
      
      {/* Connection indicator for local participant */}
      {participant.isLocal && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/30 backdrop-blur-sm rounded-full flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          <span className="text-xs text-white">Connected</span>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
