
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BackgroundSelectorProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectBackground: (background: string) => void;
}

// Virtual backgrounds options
const BACKGROUNDS = [
  { id: 'none', name: 'None', color: 'bg-gradient-to-r from-gray-700 to-gray-900' },
  { id: 'blur', name: 'Blur', color: 'bg-gradient-to-r from-gray-400 to-gray-600 opacity-50' },
  { id: 'office', name: 'Office', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
  { id: 'beach', name: 'Beach', image: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb' },
  { id: 'forest', name: 'Forest', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05' },
  { id: 'space', name: 'Space', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5' },
];

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ 
  className,
  isOpen,
  onClose,
  onSelectBackground
}) => {
  const [selectedBackground, setSelectedBackground] = useState('none');
  
  const handleSelectBackground = (backgroundId: string) => {
    setSelectedBackground(backgroundId);
    onSelectBackground(backgroundId);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Choose Background</span>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogTitle>
        </DialogHeader>
        
        <div className={cn("p-2 space-y-4", className)}>          
          <div className="grid grid-cols-3 gap-3">
            {BACKGROUNDS.map(background => (
              <button
                key={background.id}
                onClick={() => handleSelectBackground(background.id)}
                className={cn(
                  "aspect-video rounded-md overflow-hidden relative transition-all",
                  selectedBackground === background.id && "ring-2 ring-brand-blue"
                )}
              >
                {background.color && (
                  <div className={cn("absolute inset-0", background.color)} />
                )}
                {background.image && (
                  <img 
                    src={background.image} 
                    alt={background.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {selectedBackground === background.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="absolute bottom-1 left-0 right-0 text-center text-xs font-medium text-white bg-black/40 py-1">
                  {background.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackgroundSelector;
