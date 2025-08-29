
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Plus, 
  Clock, 
  Users, 
  Calendar, 
  Search,
  Link2,
  Settings,
  Play,
  MoreVertical,
  Copy,
  Edit,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CreateMeetingDialog from '@/components/meeting/CreateMeetingDialog';
import { meetingApi, type MeetingRoom } from '@/services/meetingApi';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Mock data for recent meetings and upcoming meetings
const RECENT_MEETINGS = [
  {
    id: 'abc-def-ghi',
    name: 'Team Weekly Standup',
    hostName: 'John Smith',
    participants: 8,
    duration: '45 min',
    date: '2024-01-15T10:00:00Z',
    status: 'completed'
  },
  {
    id: 'jkl-mno-pqr',
    name: 'Project Review',
    hostName: 'Sarah Johnson',
    participants: 12,
    duration: '1h 20min',
    date: '2024-01-14T14:30:00Z',
    status: 'completed'
  },
  {
    id: 'stu-vwx-yzb',
    name: 'Client Presentation',
    hostName: 'Mike Chen',
    participants: 5,
    duration: '30 min',
    date: '2024-01-13T16:00:00Z',
    status: 'completed'
  }
];

const UPCOMING_MEETINGS = [
  {
    id: 'upcoming-1',
    name: 'Sprint Planning',
    hostName: 'Alice Brown',
    scheduledTime: '2024-01-16T09:00:00Z',
    participants: 6,
    isRecurring: true
  },
  {
    id: 'upcoming-2',
    name: 'Design Review',
    hostName: 'David Wilson',
    scheduledTime: '2024-01-16T15:30:00Z',
    participants: 4,
    isRecurring: false
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createdMeetings, setCreatedMeetings] = useState<MeetingRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMeetingCreated = (meeting: MeetingRoom) => {
    setCreatedMeetings(prev => [meeting, ...prev]);
    setIsCreateDialogOpen(false);
  };

  const handleJoinMeeting = (meetingId: string) => {
    navigate(`/meeting/${meetingId}`);
  };

  const handleCopyMeetingLink = (meetingId: string) => {
    const link = meetingApi.generateMeetingLink(meetingId);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied",
      description: "Meeting link copied to clipboard",
    });
  };

  const handleQuickStart = async () => {
    setIsLoading(true);
    try {
      const quickMeeting = await meetingApi.mockCreateMeeting({
        name: `Quick Meeting - ${new Date().toLocaleTimeString()}`,
        hostName: 'You',
        isPublic: true,
      });
      
      toast({
        title: "Quick meeting created",
        description: "Starting your instant meeting...",
      });
      
      // Navigate to the meeting immediately
      navigate(`/meeting/${quickMeeting.id}`);
    } catch (error) {
      toast({
        title: "Failed to create meeting",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatUpcomingDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `In ${diffHours}h`;
    } else {
      const diffDays = Math.round(diffHours / 24);
      return `In ${diffDays}d`;
    }
  };

  const filteredRecentMeetings = RECENT_MEETINGS.filter(meeting =>
    meeting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.hostName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCreatedMeetings = createdMeetings.filter(meeting =>
    meeting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.hostName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Meeting Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your meetings, schedule new ones, and stay connected
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleQuickStart}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isLoading ? 'Starting...' : 'Quick Start'}
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Meeting
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Meetings</p>
                <p className="text-2xl font-bold">{RECENT_MEETINGS.length + createdMeetings.length}</p>
              </div>
              <Video className="w-8 h-8 text-brand-blue" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{RECENT_MEETINGS.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-brand-purple" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{UPCOMING_MEETINGS.length}</p>
              </div>
              <Clock className="w-8 h-8 text-brand-teal" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Now</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search meetings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Meetings Tabs */}
      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent Meetings</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="created">My Meetings</TabsTrigger>
        </TabsList>

        {/* Recent Meetings */}
        <TabsContent value="recent" className="space-y-4">
          {filteredRecentMeetings.length > 0 ? (
            <div className="grid gap-4">
              {filteredRecentMeetings.map((meeting) => (
                <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{meeting.name}</h3>
                          <Badge variant="secondary">{meeting.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {meeting.participants} participants
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {meeting.duration}
                          </span>
                          <span>{formatDate(meeting.date)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Hosted by {meeting.hostName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleJoinMeeting(meeting.id)}
                        >
                          View Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleCopyMeetingLink(meeting.id)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recent meetings found</h3>
              <p className="text-muted-foreground">Start by creating your first meeting</p>
            </div>
          )}
        </TabsContent>

        {/* Upcoming Meetings */}
        <TabsContent value="upcoming" className="space-y-4">
          {UPCOMING_MEETINGS.length > 0 ? (
            <div className="grid gap-4">
              {UPCOMING_MEETINGS.map((meeting) => (
                <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{meeting.name}</h3>
                          {meeting.isRecurring && <Badge variant="outline">Recurring</Badge>}
                          <Badge variant="default">{formatUpcomingDate(meeting.scheduledTime)}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {meeting.participants} participants
                          </span>
                          <span>{formatDate(meeting.scheduledTime)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Hosted by {meeting.hostName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleJoinMeeting(meeting.id)}
                        >
                          Join Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No upcoming meetings</h3>
              <p className="text-muted-foreground">Schedule your next meeting</p>
            </div>
          )}
        </TabsContent>

        {/* Created Meetings */}
        <TabsContent value="created" className="space-y-4">
          {filteredCreatedMeetings.length > 0 ? (
            <div className="grid gap-4">
              {filteredCreatedMeetings.map((meeting) => (
                <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{meeting.name}</h3>
                          <Badge variant={meeting.isPublic ? "default" : "secondary"}>
                            {meeting.isPublic ? 'Public' : 'Private'}
                          </Badge>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Max {meeting.maxParticipants}
                          </span>
                          <span>Created {formatDate(meeting.createdAt)}</span>
                          {meeting.expiresAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Expires {formatDate(meeting.expiresAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {meeting.id}
                          </code>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCopyMeetingLink(meeting.id)}
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          Copy Link
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleJoinMeeting(meeting.id)}
                        >
                          Start Meeting
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              End Meeting
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Plus className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No meetings created yet</h3>
              <p className="text-muted-foreground mb-4">Create your first meeting to get started</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Meeting
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Meeting Dialog */}
      <CreateMeetingDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onMeetingCreated={handleMeetingCreated}
      />
    </div>
  );
};

export default Dashboard;
