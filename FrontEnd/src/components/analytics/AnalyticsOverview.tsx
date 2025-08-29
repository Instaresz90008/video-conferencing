
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  MessageCircle,
  Video,
  Mail,
  TrendingUp,
  TrendingDown,
  Activity,
} from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface AnalyticsOverviewProps {
  timeRange: string;
  channel: string;
  dateRange?: DateRange;
}

const mockData = {
  totalUsers: 1247,
  activeUsers: 892,
  totalMessages: 15432,
  totalMeetings: 234,
  totalEmails: 1876,
  userGrowth: 12.5,
  engagementRate: 68.3,
  avgSessionDuration: '24m 32s',
};

const chartData = [
  { date: '2024-01-01', users: 120, messages: 1200, meetings: 45, emails: 230 },
  { date: '2024-01-02', users: 132, messages: 1350, meetings: 52, emails: 267 },
  { date: '2024-01-03', users: 145, messages: 1420, meetings: 48, emails: 289 },
  { date: '2024-01-04', users: 138, messages: 1380, meetings: 56, emails: 234 },
  { date: '2024-01-05', users: 152, messages: 1567, meetings: 61, emails: 312 },
  { date: '2024-01-06', users: 148, messages: 1489, meetings: 54, emails: 298 },
  { date: '2024-01-07', users: 165, messages: 1678, meetings: 67, emails: 345 },
];

const channelDistribution = [
  { name: 'Chat', value: 45, color: '#3b82f6' },
  { name: 'Video', value: 30, color: '#10b981' },
  { name: 'Email', value: 25, color: '#f59e0b' },
];

const chartConfig = {
  users: { label: 'Users', color: '#3b82f6' },
  messages: { label: 'Messages', color: '#10b981' },
  meetings: { label: 'Meetings', color: '#f59e0b' },
  emails: { label: 'Emails', color: '#ef4444' },
};

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  timeRange,
  channel,
  dateRange,
}) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +{mockData.userGrowth}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.activeUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {((mockData.activeUsers / mockData.totalUsers) * 100).toFixed(1)}% active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalMessages.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              Avg: {Math.round(mockData.totalMessages / mockData.activeUsers)} per user
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.engagementRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              Session: {mockData.avgSessionDuration}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="var(--color-users)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="messages"
                  stroke="var(--color-messages)"
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <PieChart>
                <Pie
                  data={channelDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {channelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
