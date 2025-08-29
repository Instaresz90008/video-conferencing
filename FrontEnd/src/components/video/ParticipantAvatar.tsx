
import React from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ParticipantAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showInitials?: boolean;
  isOnline?: boolean;
}

const ParticipantAvatar: React.FC<ParticipantAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className,
  showInitials = true,
  isOnline = false
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // For Naveen Kumar, use specific avatar or "NK" initials
  const isNaveenKumar = name.toLowerCase().includes('naveen') && name.toLowerCase().includes('kumar');
  const displayName = isNaveenKumar ? 'Naveen Kumar' : name;
  const initials = isNaveenKumar ? 'NK' : getInitials(name);

  const avatarImage = avatarUrl || (isNaveenKumar 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent('Naveen Kumar')}&background=4263EB&color=fff&size=128&bold=true`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`
  );

  return (
    <div className={cn("relative", className)}>
      <Avatar className={cn(sizeClasses[size], "border-2 border-white/20")}>
        <AvatarImage 
          src={avatarImage} 
          alt={displayName}
          className="object-cover"
        />
        <AvatarFallback className="bg-primary/80 text-white font-semibold">
          {showInitials ? initials : '?'}
        </AvatarFallback>
      </Avatar>
      
      {isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
      )}
    </div>
  );
};

export default ParticipantAvatar;
