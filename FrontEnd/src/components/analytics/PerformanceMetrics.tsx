
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Zap, Server, Network, Database } from 'lucide-react';

const performanceMetrics = [
  {
    name: 'Response Time',
    value: 245,
    target: 300,
    unit: 'ms',
    status: 'good',
    icon: <Zap className="w-4 h-4" />,
  },
  {
    name: 'CPU Usage',
    value: 34,
    target: 80,
    unit: '%',
    status: 'excellent',
    icon: <Server className="w-4 h-4" />,
  },
  {
    name: 'Memory Usage',
    value: 67,
    target: 85,
    unit: '%',
    status: 'good',
    icon: <Database className="w-4 h-4" />,
  },
  {
    name: 'Network Latency',
    value: 18,
    target: 50,
    unit: 'ms',
    status: 'excellent',
    icon: <Network className="w-4 h-4" />,
  },
];

const performanceTrends = [
  { time: '00:00', responseTime: 230, cpuUsage: 28, memoryUsage: 62 },
  { time: '04:00', responseTime: 215, cpuUsage: 22, memoryUsage: 58 },
  { time: '08:00', responseTime: 280, cpuUsage: 45, memoryUsage: 72 },
  { time: '12:00', responseTime: 320, cpuUsage: 52, memoryUsage: 78 },
  { time: '16:00', responseTime: 290, cpuUsage: 48, memoryUsage: 75 },
  { time: '20:00', responseTime: 250, cpuUsage: 35, memoryUsage: 68 },
];

const chartConfig = {
  responseTime: { label: 'Response Time (ms)', color: '#3b82f6' },
  cpuUsage: { label: 'CPU Usage (%)', color: '#10b981' },
  memoryUsage: { label: 'Memory Usage (%)', color: '#f59e0b' },
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent':
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
    case 'good':
      return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
    case 'critical':
      return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
    default:
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
  }
};

export const PerformanceMetrics: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Indicators */}
        <div className="space-y-4">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <span className="text-sm font-medium">{metric.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">
                    {metric.value}{metric.unit}
                  </span>
                  <Badge className={`text-xs ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </Badge>
                </div>
              </div>
              <Progress
                value={(metric.value / metric.target) * 100}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                Target: {metric.target}{metric.unit}
              </div>
            </div>
          ))}
        </div>

        {/* Performance Trends */}
        <div>
          <h4 className="font-semibold text-sm mb-3">24-Hour Performance Trend</h4>
          <div className="h-32">
            <ChartContainer config={chartConfig}>
              <AreaChart data={performanceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="responseTime"
                  stackId="1"
                  stroke="var(--color-responseTime)"
                  fill="var(--color-responseTime)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>

        {/* System Health Score */}
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <div className="text-2xl font-bold text-green-600">98.7%</div>
          <div className="text-sm text-muted-foreground">Overall System Health</div>
          <div className="text-xs text-muted-foreground mt-1">
            All systems operational
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
