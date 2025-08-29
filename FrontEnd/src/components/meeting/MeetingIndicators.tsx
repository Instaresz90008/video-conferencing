
import React from 'react';
import { Hand, CircleOff, Users } from 'lucide-react';

interface MeetingIndicatorsProps {
  handRaised: boolean;
  isRecording: boolean;
  participantCount: number;
}

const MeetingIndicators: React.FC<MeetingIndicatorsProps> = ({ 
  handRaised, 
  isRecording, 
  participantCount 
}) => {
  return (
    <>
      {/* Hand raised indicator */}
      {handRaised && (
        <div className="absolute top-20 left-4 bg-brand-blue/80 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center space-x-2 animate-fade-in z-20">
          <Hand className="w-4 h-4" />
          <span className="text-sm font-medium">Hand Raised</span>
        </div>
      )}
      
      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute top-32 left-4 bg-red-500/80 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center space-x-2 animate-pulse z-20">
          <CircleOff className="w-4 h-4" />
          <span className="text-sm font-medium">Recording</span>
        </div>
      )}
      
      {/* Participant count indicator */}
      <div className="absolute top-4 left-4 bg-black/40 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center space-x-2 z-20">
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">{participantCount}</span>
      </div>
    </>
  );
};

export default MeetingIndicators;
