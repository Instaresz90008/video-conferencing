
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface EmojiBurstProps {
  emoji: string;
  count?: number;
  position?: { x: number; y: number };
}

const EmojiBurst: React.FC<EmojiBurstProps> = ({ 
  emoji,
  count = 15,
  position = { x: 50, y: 50 }
}) => {
  const [emojis, setEmojis] = useState<Array<{id: number; style: React.CSSProperties}>>([]);
  
  useEffect(() => {
    const newEmojis = [];
    
    for (let i = 0; i < count; i++) {
      // Calculate random position and rotation for each emoji
      const angle = Math.random() * Math.PI * 2; // Random angle in radians
      const distance = 50 + Math.random() * 150; // Random distance from center
      const x = Math.cos(angle) * distance; // X offset
      const y = Math.sin(angle) * distance; // Y offset
      const scale = 0.5 + Math.random() * 1.8; // Random size
      const duration = 1 + Math.random() * 2; // Animation duration
      const delay = i * 0.05; // Staggered delay
      
      const style: React.CSSProperties = {
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        fontSize: `${scale}rem`,
        opacity: 0,
        // Use proper typing for custom CSS properties
        ['--x-offset' as string]: `${x}px`,
        ['--y-offset' as string]: `${y}px`,
        ['--delay' as string]: `${delay}s`,
        animation: `emoji-float ${duration}s ease-out forwards`,
        animationDelay: `${delay}s`,
      };
      
      newEmojis.push({ id: i, style });
    }
    
    setEmojis(newEmojis);
    
    // Clean up emojis after animation
    const timer = setTimeout(() => {
      setEmojis([]);
    }, count * 50 + 3000);
    
    return () => clearTimeout(timer);
  }, [emoji, count, position]);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
      {emojis.map(item => (
        <div 
          key={item.id} 
          style={item.style}
          className="emoji-float"
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

export default EmojiBurst;
