
import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import { useAppSelector } from '@/store/hooks';

interface TimelineSegment {
  time: string;
  duration: string;
  speaker: string;
  topic: string;
  keywords: string[];
}

interface MeetingTimelineProps {
  isOpen: boolean;
  onClose: () => void;
}

const MeetingTimeline: React.FC<MeetingTimelineProps> = ({ isOpen, onClose }) => {
  const [timelineData, setTimelineData] = useState<TimelineSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { participants } = useAppSelector(state => state.meeting);

  useEffect(() => {
    if (isOpen && timelineData.length === 0) {
      generateDemoTimelineData();
    }
  }, [isOpen]);

  const generateDemoTimelineData = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const demoParticipants = participants.length > 0 ? participants : [
        { name: "Emma Johnson" },
        { name: "Michael Chen" },
        { name: "Sophia Rodriguez" },
        { name: "Liam Wilson" },
        { name: "Olivia Taylor" }
      ];
      
      const topics = [
        "Project introduction",
        "Budget discussion",
        "Timeline planning",
        "Design review",
        "Q&A session",
        "Next steps",
        "Resource allocation",
        "Client feedback",
        "Technical challenges",
        "Marketing strategy"
      ];
      
      const keywords = [
        ["overview", "goals", "scope"],
        ["costs", "allocation", "forecast"],
        ["deadlines", "milestones", "dependencies"],
        ["mockups", "UI/UX", "feedback"],
        ["clarification", "concerns", "answers"],
        ["action items", "follow-up", "assignments"],
        ["team", "tools", "skills"],
        ["responses", "suggestions", "requirements"],
        ["obstacles", "solutions", "alternatives"],
        ["channels", "audience", "messaging"]
      ];
      
      // Generate timeline segments
      const data: TimelineSegment[] = [];
      let currentMinute = 0;
      
      for (let i = 0; i < 10; i++) {
        const speakerIndex = Math.floor(Math.random() * demoParticipants.length);
        const topicIndex = i % topics.length;
        const segmentDuration = 3 + Math.floor(Math.random() * 8); // 3-10 minutes
        
        const hours = Math.floor(currentMinute / 60);
        const minutes = currentMinute % 60;
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        
        data.push({
          time: timeStr,
          duration: `${segmentDuration} min`,
          speaker: demoParticipants[speakerIndex].name || `Speaker ${speakerIndex + 1}`,
          topic: topics[topicIndex],
          keywords: keywords[topicIndex]
        });
        
        currentMinute += segmentDuration;
      }
      
      setTimelineData(data);
      setIsLoading(false);
    }, 1500);
  };

  const filteredTimelineData = timelineData.filter(segment => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      segment.speaker.toLowerCase().includes(query) ||
      segment.topic.toLowerCase().includes(query) ||
      segment.keywords.some(k => k.toLowerCase().includes(query))
    );
  });

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-black/80 border border-white/10 backdrop-blur-xl rounded-xl w-full max-w-3xl max-h-[70vh] flex flex-col m-4 pb-16 md:pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🔍</span>
            <h2 className="text-xl font-semibold text-white">Meeting Timeline</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-white/80" />
          </Button>
        </div>
        
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search by speaker, topic, or keyword..."
              className="w-full bg-white/5 border border-white/10 rounded-md pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/80">Loading meeting timeline...</p>
            </div>
          ) : filteredTimelineData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-white/60">
              <p>No segments match your search</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[22px] top-6 bottom-10 w-0.5 bg-white/20"></div>
              
              <div className="space-y-6">
                {filteredTimelineData.map((segment, index) => (
                  <div 
                    key={index}
                    className="flex gap-4"
                  >
                    {/* Timeline node */}
                    <div className="relative flex flex-col items-center mt-1">
                      <div className="h-5 w-5 rounded-full bg-brand-blue border-2 border-white z-10"></div>
                      <div className="text-xs text-white/60 mt-1">{segment.time}</div>
                    </div>
                    
                    {/* Timeline content */}
                    <div className="flex-1">
                      <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-white">{segment.topic}</h3>
                          <span className="text-xs text-white/60">{segment.duration}</span>
                        </div>
                        
                        <p className="text-sm text-white/80 mb-2">Speaker: {segment.speaker}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {segment.keywords.map((keyword, kIndex) => (
                            <span 
                              key={kIndex}
                              className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/70"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t border-white/10 flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            onClick={() => generateDemoTimelineData()}
          >
            Refresh Timeline
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            Jump to Segment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MeetingTimeline;
