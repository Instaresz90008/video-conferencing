
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Users, Clock, ArrowRight, ArrowLeft, Settings, X } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toast } from "@/hooks/use-toast";
import ParticipantAvatar from '../video/ParticipantAvatar';

interface BreakoutRoom {
  id: string;
  name: string;
  participants: string[];
  duration: number; // in minutes
  startTime?: Date;
  endTime?: Date;
  isActive: boolean;
}

interface BreakoutRoomsProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

const BreakoutRooms: React.FC<BreakoutRoomsProps> = ({ 
  className,
  isOpen,
  onClose
}) => {
  const dispatch = useAppDispatch();
  const { participants } = useAppSelector(state => state.meeting);
  
  const [rooms, setRooms] = useState<BreakoutRoom[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [roomDuration, setRoomDuration] = useState(15);
  const [isAutoAssign, setIsAutoAssign] = useState(false);
  const [numberOfRooms, setNumberOfRooms] = useState(2);

  const createRoom = () => {
    if (!newRoomName.trim()) {
      toast({
        title: "Room name required",
        description: "Please enter a name for the breakout room",
        variant: "destructive",
      });
      return;
    }

    if (selectedParticipants.length === 0 && !isAutoAssign) {
      toast({
        title: "No participants selected",
        description: "Please select participants or enable auto-assign",
        variant: "destructive",
      });
      return;
    }

    const room: BreakoutRoom = {
      id: Date.now().toString(),
      name: newRoomName,
      participants: isAutoAssign ? [] : selectedParticipants,
      duration: roomDuration,
      isActive: false
    };

    setRooms(prev => [...prev, room]);
    setNewRoomName('');
    setSelectedParticipants([]);
    setIsCreating(false);

    toast({
      title: "Breakout room created",
      description: `"${room.name}" has been created`,
    });
  };

  const autoAssignParticipants = () => {
    const availableParticipants = participants.filter(p => !p.isLocal);
    const shuffled = [...availableParticipants].sort(() => Math.random() - 0.5);
    
    const newRooms: BreakoutRoom[] = [];
    const participantsPerRoom = Math.ceil(shuffled.length / numberOfRooms);

    for (let i = 0; i < numberOfRooms; i++) {
      const roomParticipants = shuffled.slice(
        i * participantsPerRoom, 
        (i + 1) * participantsPerRoom
      );

      if (roomParticipants.length > 0) {
        newRooms.push({
          id: (Date.now() + i).toString(), // Fix: Convert to string
          name: `Room ${i + 1}`,
          participants: roomParticipants.map(p => p.id),
          duration: roomDuration,
          isActive: false
        });
      }
    }

    setRooms(newRooms);
    
    toast({
      title: "Participants auto-assigned",
      description: `Created ${newRooms.length} breakout rooms`,
    });
  };

  const startRoom = (roomId: string) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { 
            ...room, 
            isActive: true, 
            startTime: new Date(),
            endTime: new Date(Date.now() + room.duration * 60 * 1000)
          }
        : room
    ));

    const room = rooms.find(r => r.id === roomId);
    toast({
      title: "Breakout room started",
      description: `"${room?.name}" is now active for ${room?.duration} minutes`,
    });
  };

  const endRoom = (roomId: string) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, isActive: false, endTime: new Date() }
        : room
    ));

    const room = rooms.find(r => r.id === roomId);
    toast({
      title: "Breakout room ended",
      description: `Participants from "${room?.name}" are returning to main room`,
    });
  };

  const endAllRooms = () => {
    setRooms(prev => prev.map(room => 
      room.isActive 
        ? { ...room, isActive: false, endTime: new Date() }
        : room
    ));

    toast({
      title: "All breakout rooms ended",
      description: "All participants are returning to the main room",
    });
  };

  const deleteRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room?.isActive) {
      toast({
        title: "Cannot delete active room",
        description: "Please end the room before deleting it",
        variant: "destructive",
      });
      return;
    }

    setRooms(prev => prev.filter(r => r.id !== roomId));
    toast({
      title: "Room deleted",
      description: `"${room?.name}" has been deleted`,
    });
  };

  const moveParticipant = (participantId: string, fromRoomId: string, toRoomId: string) => {
    setRooms(prev => prev.map(room => {
      if (room.id === fromRoomId) {
        return { ...room, participants: room.participants.filter(p => p !== participantId) };
      }
      if (room.id === toRoomId) {
        return { ...room, participants: [...room.participants, participantId] };
      }
      return room;
    }));

    const participant = participants.find(p => p.id === participantId);
    const toRoom = rooms.find(r => r.id === toRoomId);
    
    toast({
      title: "Participant moved",
      description: `${participant?.name} moved to ${toRoom?.name}`,
    });
  };

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000 / 60));
    return `${remaining} min remaining`;
  };

  const activeRooms = rooms.filter(r => r.isActive);
  const inactiveRooms = rooms.filter(r => !r.isActive);

  return (
    <>
      <div className={cn(
        "fixed inset-y-0 right-0 w-96 bg-white/10 backdrop-blur-xl border-l border-white/20 dark:bg-black/20 dark:border-white/10 flex flex-col z-20 transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}>
        {/* Header */}
        <div className="p-4 border-b border-white/20 dark:border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Breakout Rooms
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick actions */}
        <div className="p-4 border-b border-white/10 space-y-2">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="flex-1"
            >
              Create Room
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={autoAssignParticipants}
              className="flex-1"
            >
              Auto Assign
            </Button>
          </div>
          
          {activeRooms.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={endAllRooms}
              className="w-full"
            >
              End All Rooms
            </Button>
          )}
        </div>

        {/* Active rooms */}
        {activeRooms.length > 0 && (
          <div className="border-b border-white/10">
            <div className="p-3 bg-green-500/10">
              <h4 className="font-medium text-green-400 mb-2">Active Rooms ({activeRooms.length})</h4>
              {activeRooms.map(room => (
                <div key={room.id} className="mb-3 p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium">{room.name}</h5>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => endRoom(room.id)}
                      className="h-6 px-2 text-xs"
                    >
                      End
                    </Button>
                  </div>
                  
                  {room.endTime && (
                    <div className="flex items-center text-xs text-green-400 mb-2">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeRemaining(room.endTime)}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {room.participants.map(participantId => {
                      const participant = participants.find(p => p.id === participantId);
                      return participant ? (
                        <div key={participantId} className="flex items-center space-x-1 bg-white/10 rounded px-2 py-1">
                          <ParticipantAvatar 
                            name={participant.name} 
                            size="sm"
                          />
                          <span className="text-xs">{participant.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inactive rooms */}
        <div className="flex-1 overflow-y-auto p-4">
          {inactiveRooms.length > 0 && (
            <>
              <h4 className="font-medium mb-3">Prepared Rooms ({inactiveRooms.length})</h4>
              {inactiveRooms.map(room => (
                <div key={room.id} className="mb-3 p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium">{room.name}</h5>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startRoom(room.id)}
                        className="h-6 px-2 text-xs bg-green-500/20 text-green-400"
                      >
                        Start
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRoom(room.id)}
                        className="h-6 px-2 text-xs text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-2">
                    Duration: {room.duration} minutes
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {room.participants.map(participantId => {
                      const participant = participants.find(p => p.id === participantId);
                      return participant ? (
                        <div key={participantId} className="flex items-center space-x-1 bg-white/10 rounded px-2 py-1">
                          <ParticipantAvatar 
                            name={participant.name} 
                            size="sm"
                          />
                          <span className="text-xs">{participant.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          {rooms.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No breakout rooms created yet</p>
              <p className="text-sm">Create rooms to split participants into smaller groups</p>
            </div>
          )}
        </div>
      </div>

      {/* Create room dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Breakout Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Room Name *</label>
              <Input
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="e.g., Team A Discussion"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                type="number"
                value={roomDuration}
                onChange={(e) => setRoomDuration(parseInt(e.target.value) || 15)}
                min="1"
                max="60"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Participants</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {participants.filter(p => !p.isLocal).map(participant => (
                  <label key={participant.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(participant.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedParticipants(prev => [...prev, participant.id]);
                        } else {
                          setSelectedParticipants(prev => prev.filter(id => id !== participant.id));
                        }
                      }}
                      className="rounded"
                    />
                    <ParticipantAvatar name={participant.name} size="sm" />
                    <span className="text-sm">{participant.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={createRoom}>
              Create Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BreakoutRooms;
