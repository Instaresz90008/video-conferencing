
import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, CheckSquare, Square, Calendar, User, Plus, Trash2 } from "lucide-react";
import { useAppSelector } from '@/store/hooks';
import { toast } from "@/hooks/use-toast";

interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  deadline: string;
  completed: boolean;
  source: 'ai' | 'manual';
  timeCreated: string;
}

interface ActionItemsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ActionItems: React.FC<ActionItemsProps> = ({ isOpen, onClose }) => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const { participants } = useAppSelector(state => state.meeting);

  useEffect(() => {
    if (isOpen && actionItems.length === 0) {
      generateDemoActionItems();
    }
  }, [isOpen]);

  const generateDemoActionItems = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const demoParticipants = participants.length > 0 ? participants.slice(0, 5).map(p => p.name) : [
        "Emma Johnson",
        "Michael Chen",
        "Sophia Rodriguez",
        "Liam Wilson",
        "Olivia Taylor"
      ];
      
      const demoTasks = [
        "Create detailed implementation plan for the design system",
        "Schedule follow-up meeting with stakeholders",
        "Research competitive solutions in the marketplace",
        "Prepare budget proposal for Q3",
        "Update project documentation with latest changes",
        "Share meeting notes with the client",
        "Fix critical bugs in the development environment"
      ];
      
      const deadlines = [
        "Tomorrow",
        "Next Monday",
        "This Friday",
        "In two days",
        "By end of week",
        "Next sprint",
        "ASAP"
      ];
      
      // Generate random action items
      const data: ActionItem[] = [];
      
      for (let i = 0; i < 5; i++) {
        const taskIndex = i % demoTasks.length;
        const assigneeIndex = i % demoParticipants.length;
        const deadlineIndex = i % deadlines.length;
        
        data.push({
          id: `task-${i + 1}`,
          task: demoTasks[taskIndex],
          assignee: demoParticipants[assigneeIndex] || `Team Member ${assigneeIndex + 1}`,
          deadline: deadlines[deadlineIndex],
          completed: i === 1, // Make one task completed
          source: i < 3 ? 'ai' : 'manual',
          timeCreated: new Date(Date.now() - (i * 600000)).toLocaleTimeString() // Tasks created at different times
        });
      }
      
      setActionItems(data);
      setIsLoading(false);
    }, 1200);
  };

  const toggleTaskCompletion = (id: string) => {
    setActionItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    
    const item = actionItems.find(item => item.id === id);
    
    toast({
      title: `Task ${!item?.completed ? "completed" : "marked as incomplete"}`,
      description: item?.task,
      open: true,
    });
  };

  const handleDeleteTask = (id: string) => {
    const item = actionItems.find(item => item.id === id);
    
    setActionItems(prev => prev.filter(item => item.id !== id));
    
    toast({
      title: "Task deleted",
      description: item?.task,
      open: true,
    });
  };

  const handleAddNewTask = () => {
    if (!newTaskText || !newAssignee) {
      toast({
        title: "Cannot add task",
        description: "Task description and assignee are required",
        variant: "destructive",
        open: true,
      });
      return;
    }
    
    const newTask: ActionItem = {
      id: `task-${Date.now()}`,
      task: newTaskText,
      assignee: newAssignee,
      deadline: newDeadline || "Not specified",
      completed: false,
      source: 'manual',
      timeCreated: new Date().toLocaleTimeString()
    };
    
    setActionItems(prev => [newTask, ...prev]);
    
    toast({
      title: "Task added",
      description: newTaskText,
      open: true,
    });
    
    // Reset form
    setNewTaskText('');
    setNewAssignee('');
    setNewDeadline('');
    setIsAddingNew(false);
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
        className="bg-black/80 border border-white/10 backdrop-blur-xl rounded-xl w-full max-w-2xl max-h-[70vh] flex flex-col m-4 pb-16 md:pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-white/80" />
            <h2 className="text-xl font-semibold text-white">Action Items</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-white/80" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/80">Loading action items...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {isAddingNew && (
                <div className="p-4 rounded-lg border border-brand-blue/40 bg-brand-blue/10 mb-4">
                  <h3 className="font-medium text-white mb-3">New Action Item</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Description</label>
                      <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="What needs to be done?"
                        className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Assignee</label>
                      <select
                        value={newAssignee}
                        onChange={(e) => setNewAssignee(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                      >
                        <option value="">Select assignee</option>
                        {participants.map((p, index) => (
                          <option key={index} value={p.name || `Participant ${index + 1}`}>
                            {p.name || `Participant ${index + 1}`}
                          </option>
                        ))}
                        {participants.length === 0 && (
                          <>
                            <option value="Emma Johnson">Emma Johnson</option>
                            <option value="Michael Chen">Michael Chen</option>
                            <option value="Sophia Rodriguez">Sophia Rodriguez</option>
                          </>
                        )}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-white/70 mb-1">Deadline</label>
                      <input
                        type="text"
                        value={newDeadline}
                        onChange={(e) => setNewDeadline(e.target.value)}
                        placeholder="e.g., Next Friday, ASAP, etc."
                        className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        onClick={() => setIsAddingNew(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="default"
                        size="sm"
                        onClick={handleAddNewTask}
                      >
                        Add Task
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {actionItems.map((item) => (
                <div 
                  key={item.id}
                  className={`p-3 rounded-lg border ${
                    item.completed 
                      ? 'border-green-500/30 bg-green-500/5' 
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskCompletion(item.id)}
                      className="mt-0.5 text-white/80 hover:text-white"
                    >
                      {item.completed ? (
                        <CheckSquare className="w-5 h-5 text-green-400" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <p className={`mb-2 ${item.completed ? 'text-white/60 line-through' : 'text-white'}`}>
                        {item.task}
                      </p>
                      
                      <div className="flex flex-wrap items-center text-xs text-white/60 gap-3">
                        <div className="flex items-center">
                          <User className="w-3.5 h-3.5 mr-1" />
                          <span>{item.assignee}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          <span>{item.deadline}</span>
                        </div>
                        
                        {item.source === 'ai' && (
                          <span className="px-1.5 py-0.5 bg-brand-blue/20 rounded text-xs text-brand-blue/90">
                            AI detected
                          </span>
                        )}
                        
                        <span className="text-white/40">Added at {item.timeCreated}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteTask(item.id)}
                      className="text-white/40 hover:text-white/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {actionItems.length === 0 && !isAddingNew && (
                <div className="flex flex-col items-center justify-center h-32 text-white/60">
                  <p>No action items yet</p>
                  <p className="text-sm mt-1">Add a task or let AI detect action items from the conversation</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t border-white/10 flex justify-between">
          {!isAddingNew && (
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              onClick={() => setIsAddingNew(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          )}
          
          <div className="ml-auto">
            <Button 
              variant={isAddingNew ? "outline" : "default"}
              size="sm"
              disabled={isLoading}
              onClick={generateDemoActionItems}
              className={isAddingNew ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : ""}
            >
              Refresh AI Detection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionItems;
