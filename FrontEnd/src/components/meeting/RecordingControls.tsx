import React from 'react';
import { Button } from '@/components/ui/button';
import { CircleOff } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  onToggleRecording
}) => {
  return (
    <>
      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute top-16 left-4 bg-red-500 text-white px-3 py-1.5 rounded-lg flex items-center space-x-2 animate-pulse z-20">
          <CircleOff className="w-4 h-4" />
          <span className="text-sm font-medium">Recording</span>
        </div>
      )}
      
      {/* Center recording button when not recording */}
      {!isRecording && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <Button
            variant="outline"
            size="lg"
            className="bg-black/40 border-white/20 text-white hover:bg-red-500/80 transition-all hover:scale-110 rounded-full w-16 h-16 pointer-events-auto"
            onClick={onToggleRecording}
          >
            <CircleOff className="w-8 h-8" />
          </Button>
        </div>
      )}
    </>
  );
};

export default RecordingControls;