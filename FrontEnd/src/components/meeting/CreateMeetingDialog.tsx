
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Link, Settings, Clock, Users, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { meetingApi, type MeetingRoom } from '@/services/meetingApi';

interface CreateMeetingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetingCreated: (meeting: MeetingRoom) => void;
}

const CreateMeetingDialog: React.FC<CreateMeetingDialogProps> = ({
  isOpen,
  onClose,
  onMeetingCreated
}) => {
  const [meetingName, setMeetingName] = useState('');
  const [hostName, setHostName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [duration, setDuration] = useState(60);
  const [isCreating, setIsCreating] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<MeetingRoom | null>(null);

  const handleCreateMeeting = async () => {
    if (!meetingName.trim() || !hostName.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Use mock for demo - replace with actual API call
      const meeting = await meetingApi.mockCreateMeeting({
        name: meetingName,
        hostName: hostName,
        isPublic,
        password: password || undefined,
        maxParticipants,
        duration,
      });

      setCreatedMeeting(meeting);
      onMeetingCreated(meeting);
      
      toast({
        title: "Meeting created successfully",
        description: "Your meeting link is ready to share",
      });
    } catch (error) {
      toast({
        title: "Failed to create meeting",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyMeetingLink = () => {
    if (createdMeeting) {
      const link = meetingApi.generateMeetingLink(createdMeeting.id);
      navigator.clipboard.writeText(link);
      toast({
        title: "Link copied",
        description: "Meeting link copied to clipboard",
      });
    }
  };

  const resetForm = () => {
    setMeetingName('');
    setHostName('');
    setIsPublic(true);
    setPassword('');
    setMaxParticipants(50);
    setDuration(60);
    setCreatedMeeting(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {createdMeeting ? 'Meeting Created' : 'Create New Meeting'}
          </DialogTitle>
        </DialogHeader>

        {createdMeeting ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Meeting Name</Label>
                    <p className="text-sm text-muted-foreground">{createdMeeting.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Meeting ID</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-2 py-1 bg-muted rounded text-sm font-mono">
                        {createdMeeting.id}
                      </code>
                      <Button size="sm" variant="outline" onClick={copyMeetingLink}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Meeting Link</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        value={meetingApi.generateMeetingLink(createdMeeting.id)}
                        readOnly
                        className="text-xs"
                      />
                      <Button size="sm" variant="outline" onClick={copyMeetingLink}>
                        <Link className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {!createdMeeting.isPublic && createdMeeting.password && (
                    <div>
                      <Label className="text-sm font-medium">Password</Label>
                      <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {createdMeeting.password}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={() => window.open(`/meeting/${createdMeeting.id}`, '_blank')}>
                Join Meeting
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meetingName">Meeting Name *</Label>
              <Input
                id="meetingName"
                value={meetingName}
                onChange={(e) => setMeetingName(e.target.value)}
                placeholder="Enter meeting name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hostName">Your Name *</Label>
              <Input
                id="hostName"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Public Meeting</Label>
                <p className="text-xs text-muted-foreground">
                  Anyone with the link can join
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            {!isPublic && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter meeting password"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">
                  <Users className="w-4 h-4 inline mr-1" />
                  Max Participants
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 50)}
                  min="2"
                  max="500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                  min="15"
                  max="480"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleCreateMeeting} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Meeting'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateMeetingDialog;
