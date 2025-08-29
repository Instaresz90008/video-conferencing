
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
} from 'recharts';
import { Mail, Send, Reply, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface EmailAnalyticsProps {
  timeRange: string;
  dateRange?: DateRange;
}

const mockEmailData = {
  totalEmails: 1876,
  emailsSent: 1234,
  emailsReceived: 642,
  avgResponseTime: '4h 23m',
  openRate: 78.4,
  replyRate: 34.7,
};

const emailTrends = [
  { date: '2024-01-01', sent: 45, received: 32, opens: 38, replies: 12 },
  { date: '2024-01-02', sent: 52, received: 38, opens: 44, replies: 15 },
  { date: '2024-01-03', sent: 48, received: 35, opens: 41, replies: 14 },
  { date: '2024-01-04', sent: 56, received: 42, opens: 47, replies: 18 },
  { date: '2024-01-05', sent: 61, received: 45, opens: 52, replies: 21 },
  { date: '2024-01-06', sent: 54, received: 39, opens: 46, replies: 17 },
  { date: '2024-01-07', sent: 67, received: 51, opens: 58, replies: 24 },
];

const emailTypes = [
  { type: 'Work', count: 789, percentage: 42.1, color: '#3b82f6' },
  { type: 'Personal', count: 456, percentage: 24.3, color: '#10b981' },
  { type: 'Marketing', count: 234, percentage: 12.5, color: '#f59e0b' },
  { type: 'Support', count: 187, percentage: 10.0, color: '#ef4444' },
  { type: 'Other', count: 210, percentage: 11.2, color: '#8b5cf6' },
];

const responseTimeData = [
  { hour: '< 1h', count: 234, percentage: 12.5 },
  { hour: '1-4h', count: 456, percentage: 24.3 },
  { hour: '4-8h', count: 389, percentage: 20.7 },
  { hour: '8-24h', count: 298, percentage: 15.9 },
  { hour: '> 24h', count: 499, percentage: 26.6 },
];

const chartConfig = {
  sent: { label: 'Sent', color: '#3b82f6' },
  received: { label: 'Received', color: '#10b981' },
  opens: { label: 'Opens', color: '#f59e0b' },
  replies: { label: 'Replies', color: '#ef4444' },
};

export const EmailAnalytics: React.FC<EmailAnalyticsProps> = ({ timeRange, dateRange }) => {
  return (
    <div className="space-y-6">
      {/* Email Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEmailData.totalEmails.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +8.3% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEmailData.emailsSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((mockEmailData.emailsSent / mockEmailData.totalEmails) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEmailData.openRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +3.2% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reply Rate</CardTitle>
            <Reply className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEmailData.replyRate}%</div>
            <p className="text-xs text-muted-foreground">
              Avg response: {mockEmailData.avgResponseTime}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Email Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Activity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart data={emailTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="sent"
                  stroke="var(--color-sent)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="received"
                  stroke="var(--color-received)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="opens"
                  stroke="var(--color-opens)"
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <PieChart>
                <Pie
                  data={emailTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ type, percentage }) => `${type} ${percentage}%`}
                >
                  {emailTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-sent)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Email Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Email Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-right p-2">Sent</th>
                  <th className="text-right p-2">Received</th>
                  <th className="text-right p-2">Opens</th>
                  <th className="text-right p-2">Open Rate</th>
                  <th className="text-right p-2">Replies</th>
                  <th className="text-right p-2">Reply Rate</th>
                </tr>
              </thead>
              <tbody>
                {emailTrends.map((trend, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{trend.date}</td>
                    <td className="p-2 text-right">{trend.sent}</td>
                    <td className="p-2 text-right">{trend.received}</td>
                    <td className="p-2 text-right">{trend.opens}</td>
                    <td className="p-2 text-right">
                      <Badge
                        variant={((trend.opens / trend.sent) * 100) > 75 ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {Math.round((trend.opens / trend.sent) * 100)}%
                      </Badge>
                    </td>
                    <td className="p-2 text-right">{trend.replies}</td>
                    <td className="p-2 text-right">
                      <Badge
                        variant={((trend.replies / trend.opens) * 100) > 30 ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {Math.round((trend.replies / trend.opens) * 100)}%
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
