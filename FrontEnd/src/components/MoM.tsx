
import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileDown, X, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAppSelector } from '@/store/hooks';

interface MoMSection {
  type: 'decision' | 'action' | 'question' | 'discussion';
  content: string;
  timestamp: string;
  speaker?: string;
  assignee?: string;
  deadline?: string;
}

interface MoMProps {
  isOpen: boolean;
  onClose: () => void;
}

const MoM: React.FC<MoMProps> = ({ isOpen, onClose }) => {
  const [momSections, setMomSections] = useState<MoMSection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { participants } = useAppSelector(state => state.meeting);

  useEffect(() => {
    // In a real implementation, we would subscribe to transcription updates
    // and process them in real-time using an LLM to identify sections
    if (isOpen && momSections.length === 0) {
      generateDemoMoM();
    }
  }, [isOpen]);

  const generateDemoMoM = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const demoSections: MoMSection[] = [
        {
          type: 'decision',
          content: 'Team will proceed with the new design system implementation starting next sprint',
          timestamp: '00:03:45',
          speaker: participants[0]?.name || 'Emma Johnson'
        },
        {
          type: 'action',
          content: 'Create detailed implementation plan for the design system',
          timestamp: '00:07:12',
          speaker: participants[1]?.name || 'Michael Chen',
          assignee: participants[0]?.name || 'Emma Johnson',
          deadline: 'Next Friday'
        },
        {
          type: 'question',
          content: 'How will this affect our current projects timeline?',
          timestamp: '00:12:30',
          speaker: participants[2]?.name || 'Sophia Rodriguez'
        },
        {
          type: 'discussion',
          content: 'Budget implications of the new design system implementation',
          timestamp: '00:15:45',
          speaker: participants[3]?.name || 'Liam Wilson'
        },
        {
          type: 'action',
          content: 'Schedule follow-up meeting with stakeholders',
          timestamp: '00:21:08',
          speaker: participants[0]?.name || 'Emma Johnson',
          assignee: participants[0]?.name || 'Emma Johnson',
          deadline: 'This week'
        },
        {
          type: 'decision',
          content: 'Team will use the new component library for all future projects',
          timestamp: '00:25:22',
          speaker: participants[4]?.name || 'Olivia Taylor'
        },
      ];
      
      setMomSections(demoSections);
      setIsGenerating(false);
    }, 2000);
  };

  const handleExport = (format: 'pdf' | 'gdocs' | 'notion') => {
    toast({
      title: "Export initiated",
      description: `Minutes of meeting exported as ${format.toUpperCase()}`,
      open: true,
    });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'decision': return '📝';
      case 'action': return '🧩';
      case 'question': return '❓';
      case 'discussion': return '📌';
      default: return '•';
    }
  };

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
            <FileText className="w-5 h-5 text-white/80" />
            <h2 className="text-xl font-semibold text-white">Minutes of Meeting</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-white/80" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/80">Generating meeting minutes...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {momSections.map((section, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg border border-white/10 bg-white/5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getIconForType(section.type)}</span>
                      <span className="text-sm font-medium capitalize text-white/80">{section.type}</span>
                    </div>
                    <span className="text-xs text-white/60">{section.timestamp}</span>
                  </div>
                  
                  <p className="text-white mb-2">{section.content}</p>
                  
                  <div className="flex flex-wrap items-center text-xs text-white/60">
                    <span className="mr-3">Speaker: {section.speaker}</span>
                    {section.assignee && (
                      <span className="mr-3">Assignee: {section.assignee}</span>
                    )}
                    {section.deadline && (
                      <span>Deadline: {section.deadline}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t border-white/10 flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            onClick={() => generateDemoMoM()}
          >
            Regenerate
          </Button>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              onClick={() => handleExport('pdf')}
            >
              <FileDown className="w-4 h-4 mr-1" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              onClick={() => handleExport('gdocs')}
            >
              Export to Google Docs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoM;
