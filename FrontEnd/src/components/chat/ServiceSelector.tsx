
import React, { useState, useEffect } from 'react';
import { Service, Channel } from '@/types/chat';
import { chatAPI } from '@/services/chatApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Palette, Headphones, Plus, Hash, Lock, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceSelectorProps {
  selectedService?: string;
  selectedChannel?: string;
  onServiceSelect: (serviceId: string) => void;
  onChannelSelect: (channelId: string) => void;
}

const SERVICE_ICONS = {
  Code,
  Palette,
  HeadphonesIcon: Headphones,
};

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  selectedService,
  selectedChannel,
  onServiceSelect,
  onChannelSelect
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelsLoading, setChannelsLoading] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      loadChannels(selectedService);
    }
  }, [selectedService]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesData = await chatAPI.getServices();
      setServices(servicesData);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChannels = async (serviceId: string) => {
    try {
      setChannelsLoading(true);
      const channelsData = await chatAPI.getChannels(serviceId);
      setChannels(channelsData);
    } catch (error) {
      console.error('Failed to load channels:', error);
    } finally {
      setChannelsLoading(false);
    }
  };

  const getServiceIcon = (iconName: string) => {
    const IconComponent = SERVICE_ICONS[iconName as keyof typeof SERVICE_ICONS];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <Hash className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="services" className="flex-1">
        <div className="p-4 border-b">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="services" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-muted-foreground">SERVICES</h3>
                <Button size="sm" variant="ghost">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => onServiceSelect(service.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors hover:bg-muted/50 ${
                    selectedService === service.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: service.color }}
                    >
                      {getServiceIcon(service.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">{service.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {service.memberCount}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="channels" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-muted-foreground">CHANNELS</h3>
                <Button size="sm" variant="ghost">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {channelsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => onChannelSelect(channel.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors hover:bg-muted/50 ${
                      selectedChannel === channel.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        {channel.isPrivate ? (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Hash className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{channel.name}</h4>
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {channel.memberCount}
                            </span>
                            {channel.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                                {channel.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {channel.description && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {channel.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceSelector;
