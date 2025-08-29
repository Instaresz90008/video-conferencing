
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  Plus,
  MoreVertical,
  UserPlus,
  Mail,
  Phone,
  Video,
  MessageCircle,
  Crown,
  Shield,
  User,
  Settings,
  Ban,
  UserMinus,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

// Mock data for participants
const MOCK_PARTICIPANTS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'admin',
    department: 'Engineering',
    location: 'San Francisco, CA',
    isOnline: true,
    lastSeen: '2024-01-15T14:30:00Z',
    joinDate: '2023-06-15T00:00:00Z',
    meetingsAttended: 45,
    avatar: 'SJ',
    phone: '+1 (555) 123-4567'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    role: 'moderator',
    department: 'Product',
    location: 'New York, NY',
    isOnline: false,
    lastSeen: '2024-01-15T12:00:00Z',
    joinDate: '2023-08-20T00:00:00Z',
    meetingsAttended: 32,
    avatar: 'MC',
    phone: '+1 (555) 234-5678'
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    role: 'member',
    department: 'Design',
    location: 'Austin, TX',
    isOnline: true,
    lastSeen: '2024-01-15T14:25:00Z',
    joinDate: '2023-11-10T00:00:00Z',
    meetingsAttended: 18,
    avatar: 'ED',
    phone: '+1 (555) 345-6789'
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    role: 'member',
    department: 'Marketing',
    location: 'Chicago, IL',
    isOnline: false,
    lastSeen: '2024-01-15T10:30:00Z',
    joinDate: '2023-09-05T00:00:00Z',
    meetingsAttended: 28,
    avatar: 'DW',
    phone: '+1 (555) 456-7890'
  },
  {
    id: '5',
    name: 'Alice Brown',
    email: 'alice.brown@company.com',
    role: 'admin',
    department: 'Engineering',
    location: 'Seattle, WA',
    isOnline: true,
    lastSeen: '2024-01-15T14:35:00Z',
    joinDate: '2023-05-01T00:00:00Z',
    meetingsAttended: 52,
    avatar: 'AB',
    phone: '+1 (555) 567-8901'
  }
];

const ParticipantsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [participants, setParticipants] = useState(MOCK_PARTICIPANTS);

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Missing email",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    const newParticipant = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole as 'admin' | 'moderator' | 'member',
      department: 'Pending',
      location: 'Not specified',
      isOnline: false,
      lastSeen: new Date().toISOString(),
      joinDate: new Date().toISOString(),
      meetingsAttended: 0,
      avatar: inviteEmail.slice(0, 2).toUpperCase(),
      phone: 'Not provided'
    };

    setParticipants([...participants, newParticipant]);
    setInviteEmail('');
    setInviteRole('member');
    setIsInviteDialogOpen(false);

    toast({
      title: "Invitation sent",
      description: `Invitation sent to ${inviteEmail}`,
    });
  };

  const handleRoleChange = (participantId: string, newRole: 'admin' | 'moderator' | 'member') => {
    setParticipants(participants.map(p => 
      p.id === participantId ? { ...p, role: newRole } : p
    ));
    
    toast({
      title: "Role updated",
      description: "Participant role has been updated successfully",
    });
  };

  const handleRemoveParticipant = (participantId: string) => {
    setParticipants(participants.filter(p => p.id !== participantId));
    toast({
      title: "Participant removed",
      description: "Participant has been removed from the organization",
    });
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) {
      return 'Active now';
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         participant.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || participant.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const onlineCount = participants.filter(p => p.isOnline).length;
  const totalMeetings = participants.reduce((sum, p) => sum + p.meetingsAttended, 0);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Team Members</h1>
          <p className="text-muted-foreground mt-2">
            Manage your team members, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{participants.length}</p>
              </div>
              <Users className="w-8 h-8 text-brand-blue" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Online Now</p>
                <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Meetings</p>
                <p className="text-2xl font-bold">{totalMeetings}</p>
              </div>
              <Video className="w-8 h-8 text-brand-purple" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{participants.filter(p => p.role === 'admin').length}</p>
              </div>
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="moderator">Moderators</SelectItem>
            <SelectItem value="member">Members</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({filteredParticipants.length})</CardTitle>
          <CardDescription>
            Manage team member roles, permissions, and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="text-sm font-medium">
                        {participant.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {participant.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{participant.name}</h3>
                      <Badge variant={getRoleBadgeVariant(participant.role)} className="flex items-center gap-1">
                        {getRoleIcon(participant.role)}
                        {participant.role}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {participant.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {participant.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatLastSeen(participant.lastSeen)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        {participant.meetingsAttended} meetings
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        {participant.department}
                      </span>
                      <span className="text-muted-foreground">
                        Joined {new Date(participant.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Video className="w-4 h-4 mr-2" />
                        Video Call
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleRoleChange(participant.id, 'admin')}>
                        <Crown className="w-4 h-4 mr-2" />
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(participant.id, 'moderator')}>
                        <Shield className="w-4 h-4 mr-2" />
                        Make Moderator
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(participant.id, 'member')}>
                        <User className="w-4 h-4 mr-2" />
                        Make Member
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Ban className="w-4 h-4 mr-2" />
                        Block User
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleRemoveParticipant(participant.id)}
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
          
          {filteredParticipants.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No members found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms' : 'Start by inviting team members'}
              </p>
            </div>
          )}  
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteUser}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParticipantsPage;
