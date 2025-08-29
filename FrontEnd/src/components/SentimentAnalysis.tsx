
import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useAppSelector } from '@/store/hooks';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SentimentProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SentimentData {
  speaker: string;
  positive: number;
  neutral: number;
  negative: number;
  timeline: { time: string; score: number; }[];
}

const SentimentAnalysis: React.FC<SentimentProps> = ({ isOpen, onClose }) => {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'timeline'>('overview');
  const { participants } = useAppSelector(state => state.meeting);

  useEffect(() => {
    if (isOpen && sentimentData.length === 0) {
      generateDemoSentimentData();
    }
  }, [isOpen]);

  const generateDemoSentimentData = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const demoParticipants = participants.length > 0 ? participants : [
        { name: "Emma Johnson" },
        { name: "Michael Chen" },
        { name: "Sophia Rodriguez" },
        { name: "Liam Wilson" }
      ];
      
      const data = demoParticipants.slice(0, 4).map((p, index) => {
        // Generate random sentiment data
        const positive = 20 + Math.floor(Math.random() * 60);
        const negative = Math.floor(Math.random() * 30);
        const neutral = 100 - positive - negative;
        
        // Generate timeline data
        const timeline = [];
        let lastScore = 50; // Neutral starting point
        
        for (let i = 0; i < 20; i++) {
          // Generate some variation in sentiment over time
          const change = Math.floor(Math.random() * 20) - 10;
          lastScore = Math.max(0, Math.min(100, lastScore + change));
          
          const minutes = Math.floor(i / 2);
          const seconds = (i % 2) * 30;
          const time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          
          timeline.push({
            time,
            score: lastScore
          });
        }
        
        return {
          speaker: p.name || `Speaker ${index + 1}`,
          positive,
          neutral,
          negative,
          timeline
        };
      });
      
      setSentimentData(data);
      setIsLoading(false);
    }, 1500);
  };

  const getSentimentEmoji = (positive: number, negative: number) => {
    if (positive > 60) return '😊';
    if (positive > 40 && negative < 30) return '🙂';
    if (negative > 40) return '😟';
    return '😐';
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return '#4ade80';  // Green for positive
    if (score >= 40) return '#facc15';  // Yellow for neutral
    return '#f87171';  // Red for negative
  };

  const getOverallSentiment = (data: SentimentData) => {
    const score = data.positive - data.negative;
    if (score > 30) return 'Very Positive';
    if (score > 10) return 'Positive';
    if (score > -10) return 'Neutral';
    if (score > -30) return 'Negative';
    return 'Very Negative';
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
        className="bg-black/80 border border-white/10 backdrop-blur-xl rounded-xl w-full max-w-4xl max-h-[70vh] flex flex-col m-4 pb-16 md:pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🧠</span>
            <h2 className="text-xl font-semibold text-white">Meeting Sentiment Analysis</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant={activeView === 'overview' ? 'default' : 'outline'}
              size="sm"
              className={activeView === 'overview' ? '' : "bg-white/5 border-white/10 text-white hover:bg-white/10"}
              onClick={() => setActiveView('overview')}
            >
              Overview
            </Button>
            <Button 
              variant={activeView === 'timeline' ? 'default' : 'outline'}
              size="sm"
              className={activeView === 'timeline' ? '' : "bg-white/5 border-white/10 text-white hover:bg-white/10"}
              onClick={() => setActiveView('timeline')}
            >
              Timeline
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5 text-white/80" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/80">Analyzing meeting sentiment...</p>
            </div>
          ) : activeView === 'overview' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sentimentData.map((data, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg border border-white/10 bg-white/5"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getSentimentEmoji(data.positive, data.negative)}</span>
                      <h3 className="font-medium text-white">{data.speaker}</h3>
                    </div>
                    <span className="text-sm px-2 py-1 rounded-full bg-white/10">{getOverallSentiment(data)}</span>
                  </div>
                  
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Positive', value: data.positive },
                            { name: 'Neutral', value: data.neutral },
                            { name: 'Negative', value: data.negative },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          <Cell fill="#4ade80" /> {/* Green for positive */}
                          <Cell fill="#facc15" /> {/* Yellow for neutral */}
                          <Cell fill="#f87171" /> {/* Red for negative */}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="grid grid-cols-3 text-center text-sm text-white/80">
                      <div>
                        <div className="font-medium">Positive</div>
                        <div className="text-green-400">{data.positive}%</div>
                      </div>
                      <div>
                        <div className="font-medium">Neutral</div>
                        <div className="text-yellow-400">{data.neutral}%</div>
                      </div>
                      <div>
                        <div className="font-medium">Negative</div>
                        <div className="text-red-400">{data.negative}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {sentimentData.map((data, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg border border-white/10 bg-white/5"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-white">{data.speaker} - Sentiment Over Time</h3>
                  </div>
                  
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.timeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="time" 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.5)' }}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.5)' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white' 
                          }}
                          labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-2 text-sm text-white/60 text-center">
                    Sentiment score: 0 (very negative) to 100 (very positive)
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
            onClick={() => generateDemoSentimentData()}
          >
            Refresh Analysis
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis;
