
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { RadialBarChart, RadialBar, PieChart, Pie, Cell } from 'recharts';
import { Users, Clock, MessageSquare, Star } from 'lucide-react';

const engagementData = [
  { name: 'Active Users', value: 85, color: '#3b82f6' },
  { name: 'Session Time', value: 72, color: '#10b981' },
  { name: 'Interaction Rate', value: 68, color: '#f59e0b' },
  { name: 'Satisfaction', value: 91, color: '#ef4444' },
];

const userSegments = [
  { segment: 'Power Users', count: 124, percentage: 15.2, engagement: 95 },
  { segment: 'Regular Users', count: 456, percentage: 56.1, engagement: 78 },
  { segment: 'Occasional Users', count: 189, percentage: 23.2, engagement: 45 },
  { segment: 'New Users', count: 43, percentage: 5.3, engagement: 62 },
];

const chartConfig = {
  engagement: { label: 'Engagement %', color: '#3b82f6' },
};

export const UserEngagementWidget: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          User Engagement Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Engagement Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {engagementData.map((metric, index) => (
            <div key={index} className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold" style={{ color: metric.color }}>
                {metric.value}%
              </div>
              <div className="text-xs text-muted-foreground">{metric.name}</div>
            </div>
          ))}
        </div>

        {/* Radial Chart */}
        <div className="h-48">
          <ChartContainer config={chartConfig}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="80%"
              data={engagementData}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                fill="var(--color-engagement)"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </RadialBarChart>
          </ChartContainer>
        </div>

        {/* User Segments */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">User Segments</h4>
          {userSegments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded border">
              <div className="flex-1">
                <div className="font-medium text-sm">{segment.segment}</div>
                <div className="text-xs text-muted-foreground">
                  {segment.count} users ({segment.percentage}%)
                </div>
              </div>
              <Badge
                variant={segment.engagement > 80 ? 'default' : 'secondary'}
                className="text-xs"
              >
                {segment.engagement}%
              </Badge>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t">
          <div className="text-center">
            <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-sm font-medium">24m 32s</div>
            <div className="text-xs text-muted-foreground">Avg Session</div>
          </div>
          <div className="text-center">
            <MessageSquare className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-sm font-medium">47</div>
            <div className="text-xs text-muted-foreground">Interactions</div>
          </div>
          <div className="text-center">
            <Star className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-sm font-medium">4.6</div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
