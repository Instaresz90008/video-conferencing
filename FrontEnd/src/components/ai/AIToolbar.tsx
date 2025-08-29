import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckSquare } from 'lucide-react';

interface AIToolbarProps {
  onToggleMoM: () => void;
  onToggleSentiment: () => void;
  onToggleTimeline: () => void;
  onToggleActionItems: () => void;
}

const AIToolbar: React.FC<AIToolbarProps> = ({
  onToggleMoM,
  onToggleSentiment,
  onToggleTimeline,
  onToggleActionItems
}) => {
  return (
    <div className="absolute top-4 left-4 z-30 flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-1"
        onClick={onToggleMoM}
      >
        <FileText className="w-4 h-4" />
        <span>MoM</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-1"
        onClick={onToggleSentiment}
      >
        <span className="text-md">🧠</span>
        <span>Sentiment</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-1"
        onClick={onToggleTimeline}
      >
        <Clock className="w-4 h-4" />
        <span>Timeline</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-1"
        onClick={onToggleActionItems}
      >
        <CheckSquare className="w-4 h-4" />
        <span>Actions</span>
      </Button>
    </div>
  );
};

export default AIToolbar;