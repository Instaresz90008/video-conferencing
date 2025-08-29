import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Users, 
  Plus,
  Code,
  Grid,
  Palette,
  Mic,
  Search,
  Settings,
  Bell,
  Hash,
  Send,
  Phone,
  Video,
  Languages
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ServiceSelector from '@/components/chat/ServiceSelector';
import VoiceMemoRecorder from '@/components/chat/VoiceMemoRecorder';
import EnhancedCodeEditor from '@/components/chat/EnhancedCodeEditor';
import CollaborativeBoard from '@/components/chat/CollaborativeBoard';
import MessageThreads from '@/components/chat/MessageThreads';
import { toast } from '@/hooks/use-toast';
import { chatAPI } from '@/services/chatApi';
import { localStorageManager } from '@/lib/localStorage';
import { Service, Channel, ChatMessage, VoiceMemo, CodeSnippet } from '@/types/chat';
import { cn } from '@/lib/utils';
import DirectChats from '@/components/chat/DirectChats';

const ChatCenter = () => {
  const { t, i18n } = useTranslation();
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [selectedDirectChat, setSelectedDirectChat] = useState<string>('');
  const [activeBoard, setActiveBoard] = useState<string | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'direct'>('services');

  // Load initial data
  useEffect(() => {
    loadServices();
    loadChannels();
  }, []);

  // Load messages when channel changes
  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel);
    }
  }, [selectedChannel]);

  const loadServices = async () => {
    try {
      const servicesData = await chatAPI.getServices();
      setServices(servicesData);
      if (servicesData.length > 0 && !selectedService) {
        setSelectedService(servicesData[0].id);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        title: t('errorGeneric'),
        description: 'Failed to load services',
        variant: "destructive",
      });
    }
  };

  const loadChannels = async () => {
    try {
      const channelsData = await chatAPI.getChannels(selectedService);
      setChannels(channelsData);
      if (channelsData.length > 0 && !selectedChannel) {
        setSelectedChannel(channelsData[0].id);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

  const loadMessages = async (channelId: string) => {
    try {
      setIsLoading(true);
      const messagesData = await chatAPI.getMessages(channelId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSelect = async (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedChannel('');
    
    try {
      const channelsData = await chatAPI.getChannels(serviceId);
      setChannels(channelsData);
      if (channelsData.length > 0) {
        setSelectedChannel(channelsData[0].id);
      }
      
      toast({
        title: t('services'),
        description: "Service channels loaded",
      });
    } catch (error) {
      console.error('Error selecting service:', error);
    }
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    toast({
      title: t('channels'),
      description: "Channel selected",
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;

    try {
      const message = await chatAPI.sendMessage({
        content: newMessage,
        author: {
          id: 'current-user',
          name: 'You',
          status: 'online'
        },
        channelId: selectedChannel,
        type: 'text',
        reactions: [],
        mentions: [],
        isEncrypted: false
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      toast({
        title: t('send'),
        description: "Message sent successfully",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('errorGeneric'),
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const createBoard = (type: 'code' | 'whiteboard' | 'spreadsheet') => {
    setActiveBoard(type);
    toast({
      title: "Board created",
      description: `New ${type} board is ready for collaboration`,
    });
  };

  const handleVoiceMemoCreated = (voiceMemo: VoiceMemo) => {
    toast({
      title: t('voiceMemoSent'),
      description: "Your voice message has been processed and shared",
    });
    setShowVoiceRecorder(false);
  };

  const handleCodeSave = (snippet: CodeSnippet) => {
    toast({
      title: t('codeSaved'),
      description: `${snippet.title} has been saved and shared`,
    });
    setShowCodeEditor(false);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorageManager.saveLanguage(lang);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDirectChatSelect = (chatId: string) => {
    setSelectedDirectChat(chatId);
    setSelectedService('');
    setSelectedChannel('');
    setActiveTab('direct');
    // Mock load direct chat messages
    setMessages([
      {
        id: '1',
        content: 'Hello! How are you?',
        author: { id: '1', name: 'Sarah Johnson', status: 'online' },
        channelId: chatId,
        timestamp: new Date().toISOString(),
        type: 'text',
        reactions: [],
        mentions: [],
        isEncrypted: false,
        deliveryStatus: 'delivered'
      }
    ]);
  };

  return (
    <div className="container mx-auto p-6 h-screen max-h-screen">
      {/* Header - keep existing code */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient">{t('chat')} Center</h1>
          <p className="text-muted-foreground mt-2">
            Enhanced collaboration with services, voice, code, and real-time boards
          </p>
        </div>
        
        {/* ... keep existing code (language selector and buttons) */}
        <div className="flex items-center gap-3">
          <Select value={i18n.language} onValueChange={changeLanguage}>
            <SelectTrigger className="w-20">
              <Languages className="w-4 h-4" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="es">ES</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            {t('bell')}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            {t('settings')}
          </Button>
          
          {/* ... keep existing code (dialog for creating new items) */}
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Create New</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col dark:border-gray-600 dark:hover:bg-gray-700"
                  onClick={() => setShowVoiceRecorder(true)}
                >
                  <Mic className="w-6 h-6 mb-2" />
                  {t('voiceMemo')}
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col dark:border-gray-600 dark:hover:bg-gray-700"
                  onClick={() => setShowCodeEditor(true)}
                >
                  <Code className="w-6 h-6 mb-2" />
                  {t('codeEditor')}
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col dark:border-gray-600 dark:hover:bg-gray-700"
                  onClick={() => createBoard('whiteboard')}
                >
                  <Palette className="w-6 h-6 mb-2" />
                  {t('whiteboard')}
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col dark:border-gray-600 dark:hover:bg-gray-700"
                  onClick={() => createBoard('spreadsheet')}
                >
                  <Grid className="w-6 h-6 mb-2" />
                  {t('spreadsheet')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Services & Channels Sidebar */}
        <div className="col-span-3 space-y-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'services' | 'direct')}>
            <TabsList className="grid w-full grid-cols-2 dark:bg-gray-800">
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="direct">Direct</TabsTrigger>
            </TabsList>
            
            <TabsContent value="services" className="mt-4">
              <ServiceSelector
                selectedService={selectedService}
                selectedChannel={selectedChannel}
                onServiceSelect={handleServiceSelect}
                onChannelSelect={handleChannelSelect}
              />
            </TabsContent>
            
            <TabsContent value="direct" className="mt-4">
              <DirectChats
                selectedChat={selectedDirectChat}
                onChatSelect={handleDirectChatSelect}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content Area - keep existing code with updated condition */}
        <div className="col-span-9">
          <Tabs defaultValue="chat" className="h-full">
            {/* ... keep existing code (tabs header) */}
            <div className="flex items-center justify-between mb-4">
              <TabsList className="dark:bg-gray-800 dark:border-gray-700">
                <TabsTrigger value="chat" className="dark:data-[state=active]:bg-gray-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t('chat')}
                </TabsTrigger>
                <TabsTrigger value="board" className="dark:data-[state=active]:bg-gray-700">
                  <Grid className="w-4 h-4 mr-2" />
                  Board
                </TabsTrigger>
                <TabsTrigger value="code" className="dark:data-[state=active]:bg-gray-700">
                  <Code className="w-4 h-4 mr-2" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="voice" className="dark:data-[state=active]:bg-gray-700">
                  <Mic className="w-4 h-4 mr-2" />
                  Voice
                </TabsTrigger>
              </TabsList>
              
              {(selectedChannel || selectedDirectChat) && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium dark:text-white">
                      {activeTab === 'direct' ? 'Direct Chat' : 'Channel'} Active
                    </span>
                    <Badge variant="secondary">Live</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="dark:border-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="dark:border-gray-600">
                      <Video className="w-4 h-4 mr-2" />
                      Video
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <TabsContent value="chat" className="h-full">
              <Card className="h-full dark:bg-gray-800/50 dark:border-gray-700">
                {(selectedChannel || selectedDirectChat) ? (
                  <div className="h-full flex flex-col">
                    {/* ... keep existing code (search bar, messages area, message input) */}
                    <div className="p-4 border-b dark:border-gray-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search messages..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                      {/* ... keep existing code (messages rendering) */}
                      {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : messages.length > 0 ? (
                        <div className="space-y-4">
                          {messages
                            .filter(msg => 
                              !searchQuery || 
                              msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              msg.author.name.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((message) => (
                              <div key={message.id} className="flex gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="text-xs dark:bg-gray-700 dark:text-white">
                                    {message.author.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium dark:text-white">
                                      {message.author.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatTime(message.timestamp)}
                                    </span>
                                    <div className={cn(
                                      "w-2 h-2 rounded-full",
                                      message.author.status === 'online' ? 'bg-green-500' :
                                      message.author.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                                    )} />
                                    <Badge variant="outline" className="text-xs">
                                      {message.deliveryStatus}
                                    </Badge>
                                  </div>
                                  <div className="bg-muted/30 dark:bg-gray-700/50 rounded-lg p-3">
                                    <p className="text-sm dark:text-gray-200">{message.content}</p>
                                  </div>
                                  <MessageThreads
                                    message={message}
                                    onReply={(parentId, content) => {
                                      console.log('Reply to:', parentId, content);
                                    }}
                                    onPin={(messageId) => {
                                      console.log('Pin message:', messageId);
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>{t('welcomeMessage')}</p>
                        </div>
                      )}
                    </ScrollArea>

                    <div className="p-4 border-t dark:border-gray-700">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2 dark:text-white">Enhanced Chat Interface</h3>
                      <p className="text-muted-foreground mb-4">
                        {activeTab === 'direct' ? 'Select a direct chat to start messaging' : t('selectService')}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* ... keep existing code (other tab contents) */}
            <TabsContent value="board" className="h-full">
              {activeBoard ? (
                <CollaborativeBoard
                  type={activeBoard as 'code' | 'whiteboard' | 'spreadsheet'}
                  onSave={(board) => {
                    toast({
                      title: "Board saved",
                      description: `${board.name} has been saved successfully`,
                    });
                  }}
                />
              ) : (
                <Card className="h-full p-6 flex items-center justify-center dark:bg-gray-800/50 dark:border-gray-700">
                  <div className="text-center">
                    <Grid className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">Collaborative Boards</h3>
                    <p className="text-muted-foreground mb-4">
                      Create real-time collaborative boards for different purposes
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => createBoard('whiteboard')}
                        className="dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        {t('whiteboard')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => createBoard('spreadsheet')}
                        className="dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        <Grid className="w-4 h-4 mr-2" />
                        {t('spreadsheet')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => createBoard('code')}
                        className="dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        <Code className="w-4 h-4 mr-2" />
                        Code Board
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="code" className="h-full">
              {showCodeEditor ? (
                <EnhancedCodeEditor
                  collaborative={true}
                  onCodeSave={handleCodeSave}
                />
              ) : (
                <Card className="h-full p-6 flex items-center justify-center dark:bg-gray-800/50 dark:border-gray-700">
                  <div className="text-center">
                    <Code className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">Enhanced Code Editor</h3>
                    <p className="text-muted-foreground mb-4">
                      Collaborative code editing with syntax highlighting and version control
                    </p>
                    <Button onClick={() => setShowCodeEditor(true)}>
                      <Code className="w-4 h-4 mr-2" />
                      Open Code Editor
                    </Button>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="voice" className="h-full">
              <Card className="h-full p-6 dark:bg-gray-800/50 dark:border-gray-700">
                <div className="h-full flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">Voice Messages</h3>
                    <p className="text-muted-foreground">
                      Record and share voice memos with automatic transcription
                    </p>
                  </div>
                  
                  <div className="flex-1">
                    <VoiceMemoRecorder
                      onVoiceMemoCreated={handleVoiceMemoCreated}
                      maxDuration={300}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ChatCenter;
