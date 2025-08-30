import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Link, Settings, Clock, Users, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { meetingApi, type MeetingRoom, type CreateMeetingRequest } from '@/services/meetingApi';

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
  const [createError, setCreateError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication when dialog opens
  useEffect(() => {
    if (isOpen) {
      checkAuthentication();
    }
  }, [isOpen]);

  const checkAuthentication = async () => {
    try {
      const isAuthenticated = await meetingApi.checkAuth();
      if (!isAuthenticated) {
        // Try to refresh auth
        const refreshed = await meetingApi.refreshAuthIfNeeded();
        if (!refreshed) {
          setCreateError('Authentication required. Please log in to create meetings.');
        }
      }
      setAuthChecked(true);
    } catch (error) {
      console.error('Auth check error:', error);
      setCreateError('Unable to verify authentication. Please try again.');
      setAuthChecked(true);
    }
  };

  const validateForm = (): string | null => {
    if (!meetingName.trim()) {
      return 'Meeting name is required';
    }
    
    if (meetingName.trim().length < 3) {
      return 'Meeting name must be at least 3 characters';
    }

    if (meetingName.trim().length > 100) {
      return 'Meeting name must be 100 characters or less';
    }

    if (!hostName.trim()) {
      return 'Host name is required';
    }

    if (hostName.trim().length < 2) {
      return 'Host name must be at least 2 characters';
    }

    if (hostName.trim().length > 50) {
      return 'Host name must be 50 characters or less';
    }

    if (!isPublic && !password.trim()) {
      return 'Password is required for private meetings';
    }

    if (!isPublic && password.length < 4) {
      return 'Password must be at least 4 characters';
    }

    if (maxParticipants < 2 || maxParticipants > 500) {
      return 'Max participants must be between 2 and 500';
    }

    if (duration < 15 || duration > 480) {
      return 'Duration must be between 15 and 480 minutes';
    }

    return null;
  };

  const handleCreateMeeting = async () => {
    // Clear previous errors
    setCreateError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    if (!authChecked) {
      setCreateError('Please wait for authentication check to complete');
      return;
    }

    setIsCreating(true);

    try {
      const createRequest: CreateMeetingRequest = {
        name: meetingName.trim(),
        hostName: hostName.trim(),
        isPublic,
        password: password.trim() || undefined,
        maxParticipants,
        duration,
      };

      const meeting = await meetingApi.createMeeting(createRequest);

      setCreatedMeeting(meeting);
      onMeetingCreated(meeting);
      
      toast({
        title: "Meeting created successfully",
        description: "Your meeting is ready to share",
      });
    } catch (error: any) {
      console.error('Create meeting error:', error);
      
      // More specific error handling
      if (error.message.includes('authentication') || error.message.includes('auth')) {
        setCreateError('Authentication failed. Please log in and try again.');
      } else if (error.message.includes('name')) {
        setCreateError('Meeting name is invalid or already exists.');
      } else if (error.message.includes('limit') || error.message.includes('quota')) {
        setCreateError('You have reached the maximum number of meetings allowed.');
      } else {
        setCreateError('Failed to create meeting. Please check your connection and try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const copyMeetingLink = () => {
    if (createdMeeting) {
      const link = meetingApi.generateMeetingLink(createdMeeting.id);
      navigator.clipboard.writeText(link).then(() => {
        toast({
          title: "Link copied",
          description: "Meeting link copied to clipboard",
        });
      }).catch(() => {
        toast({
          title: "Copy failed",
          description: "Unable to copy link. Please copy manually.",
          variant: "destructive",
        });
      });
    }
  };

  const copyMeetingId = () => {
    if (createdMeeting) {
      navigator.clipboard.writeText(createdMeeting.id).then(() => {
        toast({
          title: "Meeting ID copied",
          description: "Meeting ID copied to clipboard",
        });
      }).catch(() => {
        toast({
          title: "Copy failed",
          description: "Unable to copy meeting ID. Please copy manually.",
          variant: "destructive",
        });
      });
    }
  };

  const copyMeetingDetails = () => {
    if (createdMeeting) {
      const details = `Meeting: ${createdMeeting.name}
Host: ${createdMeeting.hostName}
Meeting ID: ${createdMeeting.id}
Link: ${meetingApi.generateMeetingLink(createdMeeting.id)}${!createdMeeting.isPublic && createdMeeting.password ? `\nPassword: ${createdMeeting.password}` : ''}
Max Participants: ${createdMeeting.maxParticipants}${createdMeeting.expiresAt ? `\nExpires: ${new Date(createdMeeting.expiresAt).toLocaleString()}` : ''}`;

      navigator.clipboard.writeText(details).then(() => {
        toast({
          title: "Meeting details copied",
          description: "All meeting details copied to clipboard",
        });
      }).catch(() => {
        toast({
          title: "Copy failed",
          description: "Unable to copy details. Please copy manually.",
          variant: "destructive",
        });
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
    setCreateError(null);
    setAuthChecked(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatExpirationTime = (meeting: MeetingRoom) => {
    if (!meeting.expiresAt) return 'No expiration';
    
    try {
      return new Date(meeting.expiresAt).toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return meeting.expiresAt;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating && authChecked && !createdMeeting) {
      handleCreateMeeting();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Meeting Name</Label>
                    <p className="text-sm text-muted-foreground mt-1">{createdMeeting.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Meeting ID</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-2 py-1 bg-muted rounded text-sm font-mono">
                        {createdMeeting.id}
                      </code>
                      <Button size="sm" variant="outline" onClick={copyMeetingId} title="Copy Meeting ID">
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
                        className="text-xs bg-muted/50"
                      />
                      <Button size="sm" variant="outline" onClick={copyMeetingLink} title="Copy Meeting Link">
                        <Link className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {!createdMeeting.isPublic && password && (
                    <div>
                      <Label className="text-sm font-medium">
                        <Lock className="w-4 h-4 inline mr-1" />
                        Password
                      </Label>
                      <p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
                        {password}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-sm font-medium">
                        <Users className="w-4 h-4 inline mr-1" />
                        Max Participants
                      </Label>
                      <p className="text-muted-foreground mt-1">{createdMeeting.maxParticipants}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Expires
                      </Label>
                      <p className="text-muted-foreground mt-1">{formatExpirationTime(createdMeeting)}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyMeetingDetails}
                      className="w-full"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy All Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                Close
              </Button>
              <Button 
                onClick={() => window.open(`/meeting/${createdMeeting.id}`, '_blank')}
                className="w-full sm:w-auto"
              >
                Join Meeting
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Authentication Check Loading */}
            {!authChecked && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>Checking authentication...</AlertDescription>
              </Alert>
            )}

            {/* Error Display */}
            {createError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="meetingName">Meeting Name *</Label>
              <Input
                id="meetingName"
                value={meetingName}
                onChange={(e) => setMeetingName(e.target.value)}
                placeholder="Enter meeting name"
                onKeyPress={handleKeyPress}
                disabled={isCreating || !authChecked}
                maxLength={100}
                autoComplete="off"
              />
              <div className="text-xs text-muted-foreground">
                {meetingName.length}/100 characters
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hostName">Your Name *</Label>
              <Input
                id="hostName"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Enter your name"
                onKeyPress={handleKeyPress}
                disabled={isCreating || !authChecked}
                maxLength={50}
                autoComplete="name"
              />
              <div className="text-xs text-muted-foreground">
                {hostName.length}/50 characters
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Public Meeting</Label>
                <p className="text-xs text-muted-foreground">
                  Anyone with the link can join
                </p>
              </div>
              <Switch 
                checked={isPublic} 
                onCheckedChange={setIsPublic}
                disabled={isCreating || !authChecked}
              />
            </div>

            {!isPublic && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Meeting Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter meeting password"
                  onKeyPress={handleKeyPress}
                  disabled={isCreating || !authChecked}
                  minLength={4}
                  maxLength={50}
                  autoComplete="new-password"
                />
                <div className="text-xs text-muted-foreground">
                  Password must be at least 4 characters
                </div>
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
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 2 && value <= 500) {
                      setMaxParticipants(value);
                    }
                  }}
                  min="2"
                  max="500"
                  disabled={isCreating || !authChecked}
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
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 15 && value <= 480) {
                      setDuration(value);
                    }
                  }}
                  min="15"
                  max="480"
                  disabled={isCreating || !authChecked}
                />
              </div>
            </div>

            {/* Meeting Preview */}
            <Card className="bg-muted/20">
              <CardContent className="p-3">
                <Label className="text-sm font-medium">Meeting Preview</Label>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p><strong>Name:</strong> {meetingName || 'Not set'}</p>
                  <p><strong>Host:</strong> {hostName || 'Not set'}</p>
                  <p><strong>Type:</strong> {isPublic ? 'Public' : 'Private'} {!isPublic && password && '(Password protected)'}</p>
                  <p><strong>Capacity:</strong> {maxParticipants} participants</p>
                  <p><strong>Duration:</strong> {duration} minutes ({Math.floor(duration / 60)}h {duration % 60}m)</p>
                </div>
              </CardContent>
            </Card>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={isCreating}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateMeeting} 
                disabled={isCreating || !authChecked || !!createError}
                className="w-full sm:w-auto"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Meeting'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateMeetingDialog;