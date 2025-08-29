
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { MessageCircle, Hash, Users, Clock, TrendingUp } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface ChatAnalyticsProps {
  timeRange: string;
  dateRange?: DateRange;
}

const mockChatData = {
  totalMessages: 15432,
  activeChannels: 47,
  participatingUsers: 234,
  avgResponseTime: '2m 34s',
  peakHours: '2:00 PM - 4:00 PM',
  mostActiveChannel: '#general',
};

const messageVolumeData = [
  { time: '00:00', messages: 12, users: 5 },
  { time: '04:00', messages: 8, users: 3 },
  { time: '08:00', messages: 45, users: 23 },
  { time: '12:00', messages: 67, users: 34 },
  { time: '16:00', messages: 89, users: 45 },
  { time: '20:00', messages: 34, users: 18 },
];

const channelActivity = [
  { channel: '#general', messages: 2341, users: 78, sentiment: 0.8 },
  { channel: '#development', messages: 1876, users: 34, sentiment: 0.7 },
  { channel: '#design', messages: 1234, users: 23, sentiment: 0.9 },
  { channel: '#marketing', messages: 987, users: 19, sentiment: 0.6 },
  { channel: '#support', messages: 756, users: 12, sentiment: 0.5 },
];

const chartConfig = {
  messages: { label: 'Messages', color: '#3b82f6' },
  users: { label: 'Users', color: '#10b981' },
  sentiment: { label: 'Sentiment', color: '#f59e0b' },
};

export const ChatAnalytics: React.FC<ChatAnalyticsProps> = ({ timeRange, dateRange }) => {
  return (
    <div className="space-y-6">
      {/* Chat Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockChatData.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Peak: {mockChatData.peakHours}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Channels</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockChatData.activeChannels}</div>
            <p className="text-xs text-muted-foreground">
              Top: {mockChatData.mostActiveChannel}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participating Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockChatData.participatingUsers}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {Math.round(mockChatData.totalMessages / mockChatData.participatingUsers)} msg/user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockChatData.avgResponseTime}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              15% faster than last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Message Volume by Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart data={messageVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stackId="1"
                  stroke="var(--color-messages)"
                  fill="var(--color-messages)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stackId="2"
                  stroke="var(--color-users)"
                  fill="var(--color-users)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={channelActivity} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="channel" type="category" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="messages" fill="var(--color-messages)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Channel Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Channel</th>
                  <th className="text-right p-2">Messages</th>
                  <th className="text-right p-2">Users</th>
                  <th className="text-right p-2">Avg/User</th>
                  <th className="text-right p-2">Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {channelActivity.map((channel, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{channel.channel}</td>
                    <td className="p-2 text-right">{channel.messages.toLocaleString()}</td>
                    <td className="p-2 text-right">{channel.users}</td>
                    <td className="p-2 text-right">
                      {Math.round(channel.messages / channel.users)}
                    </td>
                    <td className="p-2 text-right">
                      <Badge
                        variant={channel.sentiment > 0.7 ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {(channel.sentiment * 100).toFixed(0)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
