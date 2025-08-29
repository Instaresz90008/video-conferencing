
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Clock, CheckCircle, Circle, Plus, X, Edit3 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from "@/hooks/use-toast";

interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  presenter?: string;
  isCompleted: boolean;
  startTime?: Date;
  endTime?: Date;
}

interface MeetingAgendaProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  meetingTitle?: string;
}

const INITIAL_AGENDA: AgendaItem[] = [
  {
    id: '1',
    title: 'Welcome & Introductions',
    description: 'Brief introductions from all participants',
    duration: 5,
    presenter: 'Naveen Kumar',
    isCompleted: true,
    startTime: new Date(Date.now() - 1000 * 60 * 25),
    endTime: new Date(Date.now() - 1000 * 60 * 20)
  },
  {
    id: '2',
    title: 'Project Status Update',
    description: 'Review current project milestones and deliverables',
    duration: 15,
    presenter: 'Emma Johnson',
    isCompleted: true,
    startTime: new Date(Date.now() - 1000 * 60 * 20),
    endTime: new Date(Date.now() - 1000 * 60 * 5)
  },
  {
    id: '3',
    title: 'Technical Architecture Discussion',
    description: 'Deep dive into system architecture and technical decisions',
    duration: 20,
    presenter: 'Michael Chen',
    isCompleted: false,
    startTime: new Date(Date.now() - 1000 * 60 * 5)
  },
  {
    id: '4',
    title: 'Budget Review',
    description: 'Q4 budget allocation and resource planning',
    duration: 10,
    presenter: 'Sophia Rodriguez',
    isCompleted: false
  },
  {
    id: '5',
    title: 'Next Steps & Action Items',
    description: 'Define action items and assign owners',
    duration: 10,
    presenter: 'Naveen Kumar',
    isCompleted: false
  }
];

const MeetingAgenda: React.FC<MeetingAgendaProps> = ({ 
  className,
  isOpen,
  onClose,
  meetingTitle = "Team Meeting"
}) => {
  const [agenda, setAgenda] = useState<AgendaItem[]>(INITIAL_AGENDA);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<AgendaItem>>({
    title: '',
    description: '',
    duration: 10,
    presenter: ''
  });

  const totalDuration = agenda.reduce((sum, item) => sum + item.duration, 0);
  const completedDuration = agenda
    .filter(item => item.isCompleted)
    .reduce((sum, item) => sum + item.duration, 0);

  const handleToggleComplete = (id: string) => {
    setAgenda(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            isCompleted: !item.isCompleted,
            endTime: !item.isCompleted ? new Date() : undefined
          }
        : item
    ));
    
    const item = agenda.find(a => a.id === id);
    toast({
      title: item?.isCompleted ? "Item marked incomplete" : "Item completed",
      description: `"${item?.title}" ${item?.isCompleted ? 'reopened' : 'marked as done'}`,
    });
  };

  const handleAddItem = () => {
    if (!newItem.title?.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the agenda item",
        variant: "destructive",
      });
      return;
    }

    const item: AgendaItem = {
      id: Date.now().toString(),
      title: newItem.title,
      description: newItem.description,
      duration: newItem.duration || 10,
      presenter: newItem.presenter,
      isCompleted: false
    };

    setAgenda(prev => [...prev, item]);
    setNewItem({ title: '', description: '', duration: 10, presenter: '' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Agenda item added",
      description: `"${item.title}" added to the agenda`,
    });
  };

  const handleDeleteItem = (id: string) => {
    const item = agenda.find(a => a.id === id);
    setAgenda(prev => prev.filter(a => a.id !== id));
    
    toast({
      title: "Agenda item removed",
      description: `"${item?.title}" removed from agenda`,
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentAgendaItem = () => {
    return agenda.find(item => item.startTime && !item.endTime) || null;
  };

  const currentItem = getCurrentAgendaItem();

  return (
    <>
      <div className={cn(
        "fixed inset-y-0 left-0 w-96 bg-white/10 backdrop-blur-xl border-r border-white/20 dark:bg-black/20 dark:border-white/10 flex flex-col z-20 transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        {/* Header */}
        <div className="p-4 border-b border-white/20 dark:border-white/10 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Meeting Agenda</h3>
            <p className="text-sm text-muted-foreground">{meetingTitle}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="p-4 border-b border-white/10">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{completedDuration} / {totalDuration} minutes</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(completedDuration / totalDuration) * 100}%` }}
            />
          </div>
        </div>

        {/* Current item highlight */}
        {currentItem && (
          <div className="p-4 bg-primary/20 border-b border-white/10">
            <div className="flex items-center text-sm font-medium mb-1">
              <Clock className="w-4 h-4 mr-2" />
              Currently Discussing
            </div>
            <p className="font-semibold">{currentItem.title}</p>
            <p className="text-sm text-muted-foreground">
              Presenter: {currentItem.presenter}
            </p>
          </div>
        )}

        {/* Agenda items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {agenda.map((item, index) => (
            <div 
              key={item.id}
              className={cn(
                "p-3 rounded-lg border transition-all",
                item.isCompleted ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/10",
                currentItem?.id === item.id && "ring-2 ring-primary/50 bg-primary/10"
              )}
            >
              <div className="flex items-start justify-between">
                <button
                  onClick={() => handleToggleComplete(item.id)}
                  className="mt-0.5 mr-3 hover:scale-110 transition-transform"
                >
                  {item.isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={cn(
                      "font-medium text-sm",
                      item.isCompleted && "line-through text-muted-foreground"
                    )}>
                      {index + 1}. {item.title}
                    </h4>
                    <span className="text-xs text-muted-foreground ml-2">
                      {item.duration}min
                    </span>
                  </div>
                  
                  {item.description && (
                    <p className={cn(
                      "text-xs text-muted-foreground mb-2",
                      item.isCompleted && "line-through"
                    )}>
                      {item.description}
                    </p>
                  )}
                  
                  {item.presenter && (
                    <p className="text-xs font-medium text-primary">
                      Presenter: {item.presenter}
                    </p>
                  )}
                  
                  {item.startTime && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Started: {formatTime(item.startTime)}
                      {item.endTime && ` • Ended: ${formatTime(item.endTime)}`}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                  className="ml-2 h-6 w-6 p-0 hover:bg-destructive/20"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add item button */}
        <div className="p-4 border-t border-white/10">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Agenda Item
          </Button>
        </div>
      </div>

      {/* Add item dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Agenda Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={newItem.title || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Agenda item title"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newItem.description || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  value={newItem.duration || 10}
                  onChange={(e) => setNewItem(prev => ({ ...prev, duration: parseInt(e.target.value) || 10 }))}
                  min="1"
                  max="120"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Presenter</label>
                <Input
                  value={newItem.presenter || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, presenter: e.target.value }))}
                  placeholder="Optional presenter"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>
              Add Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MeetingAgenda;
