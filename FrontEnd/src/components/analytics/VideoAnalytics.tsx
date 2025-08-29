
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { Video, Clock, Users, Wifi, TrendingUp, TrendingDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface VideoAnalyticsProps {
  timeRange: string;
  dateRange?: DateRange;
}

const mockVideoData = {
  totalMeetings: 234,
  totalDuration: '1,247h 23m',
  avgMeetingDuration: '32m 15s',
  totalParticipants: 1876,
  avgParticipants: 8.2,
  connectionQuality: 94.3,
};

const meetingTrends = [
  { date: '2024-01-01', meetings: 15, duration: 480, participants: 45, quality: 92 },
  { date: '2024-01-02', meetings: 18, duration: 576, participants: 54, quality: 94 },
  { date: '2024-01-03', meetings: 22, duration: 704, participants: 66, quality: 96 },
  { date: '2024-01-04', meetings: 19, duration: 608, participants: 57, quality: 93 },
  { date: '2024-01-05', meetings: 25, duration: 800, participants: 75, quality: 95 },
  { date: '2024-01-06', meetings: 21, duration: 672, participants: 63, quality: 94 },
  { date: '2024-01-07', meetings: 28, duration: 896, participants: 84, quality: 97 },
];

const meetingDurations = [
  { range: '< 15m', count: 45, percentage: 19.2 },
  { range: '15-30m', count: 89, percentage: 38.0 },
  { range: '30-60m', count: 67, percentage: 28.6 },
  { range: '1-2h', count: 23, percentage: 9.8 },
  { range: '> 2h', count: 10, percentage: 4.3 },
];

const qualityMetrics = [
  { metric: 'Video Quality', value: 94.3, color: '#10b981' },
  { metric: 'Audio Quality', value: 96.7, color: '#3b82f6' },
  { metric: 'Connection Stability', value: 92.1, color: '#f59e0b' },
  { metric: 'Screen Share Quality', value: 89.4, color: '#ef4444' },
];

const chartConfig = {
  meetings: { label: 'Meetings', color: '#3b82f6' },
  duration: { label: 'Duration (min)', color: '#10b981' },
  participants: { label: 'Participants', color: '#f59e0b' },
  quality: { label: 'Quality %', color: '#ef4444' },
};

export const VideoAnalytics: React.FC<VideoAnalyticsProps> = ({ timeRange, dateRange }) => {
  return (
    <div className="space-y-6">
      {/* Video Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockVideoData.totalMeetings}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +12% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockVideoData.totalDuration}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {mockVideoData.avgMeetingDuration}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockVideoData.totalParticipants.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {mockVideoData.avgParticipants} per meeting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Quality</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockVideoData.connectionQuality}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +2.1% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Meeting Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart data={meetingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="meetings"
                  stroke="var(--color-meetings)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="participants"
                  stroke="var(--color-participants)"
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meeting Duration Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={meetingDurations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-meetings)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quality Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{metric.metric}</span>
                  <span className="font-medium">{metric.value}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${metric.value}%`,
                      backgroundColor: metric.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meeting Details */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Meeting Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-right p-2">Meetings</th>
                  <th className="text-right p-2">Avg Duration</th>
                  <th className="text-right p-2">Participants</th>
                  <th className="text-right p-2">Quality</th>
                </tr>
              </thead>
              <tbody>
                {meetingTrends.map((trend, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{trend.date}</td>
                    <td className="p-2 text-right">{trend.meetings}</td>
                    <td className="p-2 text-right">{Math.round(trend.duration / trend.meetings)}m</td>
                    <td className="p-2 text-right">{trend.participants}</td>
                    <td className="p-2 text-right">
                      <Badge
                        variant={trend.quality > 95 ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {trend.quality}%
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
