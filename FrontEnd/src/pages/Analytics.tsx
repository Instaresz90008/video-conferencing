
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/analytics/DateRangePicker';
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { ChatAnalytics } from '@/components/analytics/ChatAnalytics';
import { VideoAnalytics } from '@/components/analytics/VideoAnalytics';
import { EmailAnalytics } from '@/components/analytics/EmailAnalytics';
import { RealTimeMetrics } from '@/components/analytics/RealTimeMetrics';
import { UserEngagementWidget } from '@/components/analytics/UserEngagementWidget';
import { PerformanceMetrics } from '@/components/analytics/PerformanceMetrics';
import { ExportAnalytics } from '@/components/analytics/ExportAnalytics';
import { BarChart3, Calendar, Download, Filter, RefreshCw } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { analytics } from '@/lib/analytics';
import { useEffect } from 'react';

const Analytics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    analytics.page('/analytics');
    analytics.track('analytics_page_viewed', {
      timeRange: selectedTimeRange,
      channel: selectedChannel
    });
  }, [selectedTimeRange, selectedChannel]);

  const handleRefresh = () => {
    setIsLoading(true);
    analytics.track('analytics_refreshed', {
      timeRange: selectedTimeRange,
      channel: selectedChannel
    });
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights across all communication channels
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <ExportAnalytics />
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <DatePickerWithRange
                  date={dateRange}
                  setDate={setDateRange}
                />
              </div>

              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="chat">Chat Only</SelectItem>
                  <SelectItem value="video">Video Only</SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Metrics */}
        <RealTimeMetrics />

        {/* Main Analytics Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AnalyticsOverview
              timeRange={selectedTimeRange}
              channel={selectedChannel}
              dateRange={dateRange}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UserEngagementWidget />
              <PerformanceMetrics />
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <ChatAnalytics
              timeRange={selectedTimeRange}
              dateRange={dateRange}
            />
          </TabsContent>

          <TabsContent value="video">
            <VideoAnalytics
              timeRange={selectedTimeRange}
              dateRange={dateRange}
            />
          </TabsContent>

          <TabsContent value="email">
            <EmailAnalytics
              timeRange={selectedTimeRange}
              dateRange={dateRange}
            />
          </TabsContent>

          <TabsContent value="engagement">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <UserEngagementWidget />
              <PerformanceMetrics />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
