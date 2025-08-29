
import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, Users, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { meetingApi } from '@/services/meetingApi';

interface QuickMeetingButtonsProps {
  onQuickSync?: () => void;
  onHuddle?: () => void;
}

export const QuickMeetingButtons: React.FC<QuickMeetingButtonsProps> = ({
  onQuickSync,
  onHuddle
}) => {
  const navigate = useNavigate();

  const handleQuickSync = async () => {
    try {
      const meeting = await meetingApi.mockCreateMeeting({
        name: `Quick Sync - ${new Date().toLocaleDateString()}`,
        hostName: 'Host',
        isPublic: true,
        maxParticipants: 5,
        duration: 15
      });

      toast({
        title: "Quick Sync Created",
        description: "15-minute sync meeting started",
      });

      navigate(`/meeting/${meeting.id}`);
      onQuickSync?.();
    } catch (error) {
      toast({
        title: "Failed to Start Sync",
        description: "Could not create quick sync meeting",
        variant: "destructive",
      });
    }
  };

  const handleHuddle = async () => {
    try {
      const meeting = await meetingApi.mockCreateMeeting({
        name: `Team Huddle - ${new Date().toLocaleDateString()}`,
        hostName: 'Host',
        isPublic: true,
        maxParticipants: 10,
        duration: 30
      });

      toast({
        title: "Huddle Started",
        description: "Team huddle meeting is ready",
      });

      navigate(`/meeting/${meeting.id}`);
      onHuddle?.();
    } catch (error) {
      toast({
        title: "Failed to Start Huddle",
        description: "Could not create huddle meeting",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleQuickSync}
        className="flex-1"
      >
        <Zap className="w-4 h-4 mr-2" />
        Quick Sync
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleHuddle}
        className="flex-1"
      >
        <Users className="w-4 h-4 mr-2" />
        Huddle
      </Button>
    </div>
  );
};
