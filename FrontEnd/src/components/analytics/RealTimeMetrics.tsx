import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, MessageCircle, Video, Wifi } from 'lucide-react';

interface RealTimeMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  status: 'online' | 'busy' | 'offline';
  icon: React.ReactNode;
}

export const RealTimeMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([
    {
      id: 'active-users',
      label: 'Active Users',
      value: 147,
      change: 0,
      status: 'online',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'live-meetings',
      label: 'Live Meetings',
      value: 23,
      change: 0,
      status: 'online',
      icon: <Video className="w-4 h-4" />,
    },
    {
      id: 'active-chats',
      label: 'Active Chats',
      value: 89,
      change: 0,
      status: 'online',
      icon: <MessageCircle className="w-4 h-4" />,
    },
    {
      id: 'system-health',
      label: 'System Health',
      value: 98.7,
      change: 0,
      status: 'online',
      icon: <Activity className="w-4 h-4" />,
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev =>
        prev.map(metric => {
          const change = Math.random() * 10 - 5; // Random change between -5 and 5
          let newValue = metric.value + change;
          
          // Keep values within reasonable bounds
          if (metric.id === 'system-health') {
            newValue = Math.max(85, Math.min(100, newValue));
          } else if (metric.id === 'active-users') {
            newValue = Math.max(50, Math.min(200, newValue));
          } else {
            newValue = Math.max(0, newValue);
          }

          return {
            ...metric,
            value: Number(newValue.toFixed(1)),
            change: Number(change.toFixed(1)),
          };
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Real-Time Metrics
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(metric => (
            <div
              key={metric.id}
              className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(metric.status)}`} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {metric.id === 'system-health' ? `${metric.value}%` : Math.round(metric.value)}
                </div>
                
                {metric.change !== 0 && (
                  <Badge
                    variant={metric.change > 0 ? 'default' : 'secondary'}
                    className={`text-xs ${
                      metric.change > 0 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {metric.change > 0 ? '+' : ''}{metric.change}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
