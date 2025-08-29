import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import VideoGrid from '@/components/VideoGrid';
import ControlBar from '@/components/ControlBar';
import EnhancedChatPanel from '@/components/chat/EnhancedChatPanel';
import ThemeToggle from '@/components/ThemeToggle';
import EmojiBurst from '@/components/EmojiBurst';
import BackgroundSelector from '@/components/BackgroundSelector';
import ParticipantsPanel from '@/components/ParticipantsPanel';
import MoM from '@/components/MoM';
import SentimentAnalysis from '@/components/SentimentAnalysis';
import MeetingTimeline from '@/components/MeetingTimeline';
import ActionItems from '@/components/ActionItems';
import AIToolbar from '@/components/ai/AIToolbar';
import EmojiReactions from '@/components/meeting/EmojiReactions';
import RecordingControls from '@/components/meeting/RecordingControls';
import MeetingIndicators from '@/components/meeting/MeetingIndicators';
import BackgroundElements from '@/components/decorative/BackgroundElements';
import MeetingAgenda from '@/components/meeting/MeetingAgenda';
import BreakoutRooms from '@/components/meeting/BreakoutRooms';
import AdvancedControls from '@/components/meeting/AdvancedControls';
import MeetingJoinScreen from '@/components/meeting/MeetingJoinScreen';
import MeetingNotFound from '@/components/meeting/MeetingNotFound';
import { useIntegratedMeeting } from '@/hooks/useIntegratedMeeting';
import { useMeetingValidation } from '@/hooks/useMeetingValidation';
import { toast } from "@/hooks/use-toast";
import { Video, Users, MessageCircle, Calendar, ArrowRight } from 'lucide-react';

const Index = () => {
  const { meetingId } = useParams<{ meetingId?: string }>();
  const navigate = useNavigate();
  const hasAutoJoined = useRef(false);
  
  const {
    meeting,
    media,
    chat,
    ui,
    handleJoinMeeting,
    handleToggleVideo,
    handleToggleAudio,
    handleToggleScreenShare,
    handleSendMessage,
    toggleChat,
    handleEmojiClick,
    handleBackgroundChange,
    handleLayoutChange,
    handleToggleRecording,
    handleRaiseHand,
    togglePanel,
  } = useIntegratedMeeting();

  // Validate meeting if accessing via link
  const { meeting: meetingData, isLoading, error, isValid } = useMeetingValidation(meetingId);

  // Handle joining from meeting link
  const handleJoinFromLink = (participantName: string) => {
    if (meetingData) {
      handleJoinMeeting(participantName, meetingData.name);
      toast({
        title: "Joined meeting",
        description: `Welcome to ${meetingData.name}`,
      });
    }
  };

  // Improved background styling with theme compatibility
  const getBackgroundStyle = () => {
    if (ui?.backgroundImage && ui.backgroundImage !== 'none') {
      if (ui.backgroundImage === 'blur') {
        return {
          backgroundColor: 'hsl(var(--background))',
          backgroundImage: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--secondary) / 0.1) 100%)',
        };
      }
      return {
        backgroundColor: 'hsl(var(--background))',
        backgroundImage: `linear-gradient(135deg, hsl(var(--primary) / 0.2) 0%, hsl(var(--secondary) / 0.2) 100%), url(https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    
    return {
      backgroundColor: 'hsl(var(--background))',
      backgroundImage: 'linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--secondary) / 0.05) 100%)',
    };
  };

  // Early return with error boundary if essential state is missing
  if (!meeting || !media || !chat || !ui) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-xl text-destructive mb-2">Application Error</h1>
          <p className="text-muted-foreground">Failed to initialize application state. Please refresh the page.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reload Application
          </Button>
        </div>
      </div>
    );
  }

  // If accessing via meeting link, show validation states
  if (meetingId) {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground" style={getBackgroundStyle()}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Validating meeting...</p>
          </div>
        </div>
      );
    }

    if (!isValid || error || !meetingData) {
      return <MeetingNotFound error={error || 'Meeting not found'} meetingId={meetingId} />;
    }

    // Show join screen if not in meeting yet
    if (!meeting.isMeetingJoined) {
      return (
        <div 
          className="min-h-screen flex flex-col text-foreground relative overflow-hidden"
          style={getBackgroundStyle()}
        >
          <div className="absolute top-4 right-4 z-30">
            <ThemeToggle />
          </div>
          
          <MeetingJoinScreen 
            meeting={meetingData}
            onJoinMeeting={handleJoinFromLink}
          />
          
          <BackgroundElements />
        </div>
      );
    }

    // Render active meeting interface with proper theming
    return (
      <div 
        className="min-h-screen flex flex-col text-foreground relative overflow-hidden"
        style={getBackgroundStyle()}
      >
        {/* Fixed theme toggle */}
        <div className="absolute top-4 right-4 z-30">
          <ThemeToggle />
        </div>
        
        {/* AI features toolbar */}
        <AIToolbar
          onToggleMoM={() => togglePanel('isMomOpen')}
          onToggleSentiment={() => togglePanel('isSentimentOpen')}
          onToggleTimeline={() => togglePanel('isTimelineOpen')}
          onToggleActionItems={() => togglePanel('isActionItemsOpen')}
        />
        
        {/* Main meeting content */}
        <div className="flex-1 flex flex-col relative">
          {/* Video grid */}
          <div className="absolute inset-0">
            <VideoGrid 
              layout={ui.videoLayout as 'grid' | 'speaker' | 'pip' | 'pbp' | 'list'} 
              background={ui.backgroundImage}
              onLayoutChange={handleLayoutChange}
            />
          </div>
          
          {/* Recording controls */}
          <RecordingControls 
            isRecording={ui.isRecording}
            onToggleRecording={handleToggleRecording}
          />
          
          {/* Emoji reactions */}
          <EmojiReactions
            onEmojiClick={handleEmojiClick}
            onRaiseHand={handleRaiseHand}
            handRaised={ui.handRaised}
          />
          
          {/* Meeting indicators */}
          <MeetingIndicators 
            handRaised={ui.handRaised}
            isRecording={ui.isRecording}
            participantCount={meeting.participants?.length || 0} 
          />
          
          {/* Control bar */}
          <div className="absolute bottom-0 left-0 right-0 z-50">
            <ControlBar 
              onToggleChat={toggleChat}
              isChatOpen={chat.isOpen}
              onToggleParticipants={() => togglePanel('isParticipantsPanelOpen')}
              isParticipantsPanelOpen={ui.isParticipantsPanelOpen}
              onOpenBackgroundSelector={() => togglePanel('isBackgroundSelectorOpen')}
              onToggleAgenda={() => togglePanel('isAgendaOpen')}
              onToggleBreakoutRooms={() => togglePanel('isBreakoutRoomsOpen')}
              onToggleAdvancedControls={() => togglePanel('isAdvancedControlsOpen')}
            />
          </div>
          
          {/* Chat panel */}
          <EnhancedChatPanel 
            isOpen={chat.isOpen} 
            onClose={toggleChat}
            isFullScreen={chat.isFullScreen}
            onToggleFullScreen={() => togglePanel('isFullScreen' as any)}
            onSendMessage={handleSendMessage}
            unreadCount={chat.unreadCount}
          />
          
          {/* Side panels */}
          <ParticipantsPanel 
            isOpen={ui.isParticipantsPanelOpen} 
            onClose={() => togglePanel('isParticipantsPanelOpen')} 
          />
          
          <BackgroundSelector 
            isOpen={ui.isBackgroundSelectorOpen}
            onClose={() => togglePanel('isBackgroundSelectorOpen')}
            onSelectBackground={handleBackgroundChange}
          />

          <MeetingAgenda 
            isOpen={ui.isAgendaOpen}
            onClose={() => togglePanel('isAgendaOpen')}
          />
          
          <BreakoutRooms 
            isOpen={ui.isBreakoutRoomsOpen}
            onClose={() => togglePanel('isBreakoutRoomsOpen')}
          />
          
          <AdvancedControls 
            isOpen={ui.isAdvancedControlsOpen}
            onClose={() => togglePanel('isAdvancedControlsOpen')}
          />

          {/* AI Components */}
          <MoM 
            isOpen={ui.isMomOpen} 
            onClose={() => togglePanel('isMomOpen')} 
          />
          
          <SentimentAnalysis 
            isOpen={ui.isSentimentOpen} 
            onClose={() => togglePanel('isSentimentOpen')} 
          />
          
          <MeetingTimeline 
            isOpen={ui.isTimelineOpen} 
            onClose={() => togglePanel('isTimelineOpen')} 
          />
          
          <ActionItems 
            isOpen={ui.isActionItemsOpen} 
            onClose={() => togglePanel('isActionItemsOpen')} 
          />
          
          {/* Emoji burst animation */}
          {ui.burstEmoji && (
            <EmojiBurst 
              key={`burst-${ui.burstEmoji.key}`}
              emoji={ui.burstEmoji.emoji} 
              position={{ x: 20, y: 70 }}
            />
          )}
        </div>
        
        {/* Background decorative elements */}
        <BackgroundElements />
      </div>
    );
  }

  // Home page when no meeting ID is provided - redirect to new Home page
  return (
    <div 
      className="min-h-screen flex flex-col text-foreground relative overflow-hidden"
      style={getBackgroundStyle()}
    >
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-foreground animate-fade-in">
              Welcome to <span className="text-primary">MeetConnect</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              You're in the meeting interface. Ready to start or join a meeting?
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <Card className="hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/dashboard')}>
              <CardContent className="p-6 text-center">
                <Video className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Start Meeting</h3>
                <p className="text-sm text-muted-foreground">Create a new meeting</p>
                <ArrowRight className="w-4 h-4 mx-auto mt-4 text-primary" />
              </CardContent>
            </Card>
            
            <Card className="hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/participants')}>
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Manage Team</h3>
                <p className="text-sm text-muted-foreground">View participants</p>
                <ArrowRight className="w-4 h-4 mx-auto mt-4 text-primary" />
              </CardContent>
            </Card>
            
            <Card className="hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/chat')}>
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Chat Center</h3>
                <p className="text-sm text-muted-foreground">Access conversations</p>
                <ArrowRight className="w-4 h-4 mx-auto mt-4 text-primary" />
              </CardContent>
            </Card>
            
            <Card className="hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/')}>
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Go Home</h3>
                <p className="text-sm text-muted-foreground">Return to homepage</p>
                <ArrowRight className="w-4 h-4 mx-auto mt-4 text-primary" />
              </CardContent>
            </Card>
          </div>
          
          <div className="pt-8">
            <Button 
              size="lg" 
              className="px-8 py-3 text-lg"
              onClick={() => navigate('/dashboard')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
      
      <BackgroundElements />
    </div>
  );
};

export default Index;
