
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  MessageCircle, 
  Users, 
  Calendar, 
  Phone,
  Mail,
  Settings,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import QuickMeetingCreator from '@/components/meeting/QuickMeetingCreator';

const Home = () => {
  const recentMeetings = [
    { id: '1', name: 'Team Standup', time: '2 hours ago', participants: 8 },
    { id: '2', name: 'Product Review', time: 'Yesterday', participants: 12 },
    { id: '3', name: 'Client Presentation', time: '2 days ago', participants: 5 },
  ];

  const upcomingMeetings = [
    { id: '1', name: 'Weekly Review', time: 'Today 3:00 PM', participants: 6 },
    { id: '2', name: 'Project Planning', time: 'Tomorrow 10:00 AM', participants: 4 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Welcome to VideoMeet
          </h1>
          <p className="text-lg text-muted-foreground">
            Your unified communications platform for seamless collaboration
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <QuickMeetingCreator />
          </div>
          
          <div className="space-y-4">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/chat">
                    <Button variant="outline" className="w-full h-16 bg-white/5 hover:bg-white/10">
                      <div className="text-center">
                        <MessageCircle className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-sm">Chat</div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link to="/email">
                    <Button variant="outline" className="w-full h-16 bg-white/5 hover:bg-white/10">
                      <div className="text-center">
                        <Mail className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-sm">Email</div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full h-16 bg-white/5 hover:bg-white/10">
                      <div className="text-center">
                        <Calendar className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-sm">Meetings</div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link to="/participants">
                    <Button variant="outline" className="w-full h-16 bg-white/5 hover:bg-white/10">
                      <div className="text-center">
                        <Users className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-sm">Contacts</div>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent & Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <div className="font-medium">{meeting.name}</div>
                      <div className="text-sm text-muted-foreground">{meeting.time}</div>
                    </div>
                    <Badge variant="secondary">
                      {meeting.participants} participants
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <div className="font-medium">{meeting.name}</div>
                      <div className="text-sm text-muted-foreground">{meeting.time}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {meeting.participants} invited
                      </Badge>
                      <Button size="sm">Join</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Communication Hub */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Communication Hub
            </CardTitle>
            <CardDescription>
              Unified access to all your communication channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/chat">
                <Card className="hover:bg-white/5 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <MessageCircle className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                    <h3 className="font-semibold mb-2">Team Chat</h3>
                    <p className="text-sm text-muted-foreground">
                      Instant messaging with services integration
                    </p>
                    <Badge className="mt-2" variant="outline">12 active</Badge>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/email">
                <Card className="hover:bg-white/5 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Mail className="w-8 h-8 mx-auto mb-3 text-green-500" />
                    <h3 className="font-semibold mb-2">Email</h3>
                    <p className="text-sm text-muted-foreground">
                      Professional email management
                    </p>
                    <Badge className="mt-2" variant="outline">5 unread</Badge>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/dashboard">
                <Card className="hover:bg-white/5 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Video className="w-8 h-8 mx-auto mb-3 text-purple-500" />
                    <h3 className="font-semibold mb-2">Video Meetings</h3>
                    <p className="text-sm text-muted-foreground">
                      Schedule and join video conferences
                    </p>
                    <Badge className="mt-2" variant="outline">2 upcoming</Badge>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
