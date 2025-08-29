import React from 'react';
import { Button } from '@/components/ui/button';
import { Hand, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmojiReactionsProps {
  onEmojiClick: (emoji: string) => void;
  onRaiseHand: () => void;
  handRaised: boolean;
}

const EmojiReactions: React.FC<EmojiReactionsProps> = ({
  onEmojiClick,
  onRaiseHand,
  handRaised
}) => {
  const quickEmojis = ['👍', '👏', '❤️', '🔥'];

  return (
    <div className="absolute bottom-20 left-4 z-10">
      <div className="flex space-x-2">
        {quickEmojis.map(emoji => (
          <Button
            key={emoji}
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-transform hover:scale-110 active:scale-95"
            onClick={() => onEmojiClick(emoji)}
          >
            <span className="text-xl">{emoji}</span>
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-transform hover:scale-110 active:scale-95"
        >
          <Smile className="w-5 h-5" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "transition-transform hover:scale-110 active:scale-95",
            handRaised 
              ? 'bg-brand-blue text-white' 
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
          )}
          onClick={onRaiseHand}
        >
          <Hand className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default EmojiReactions;