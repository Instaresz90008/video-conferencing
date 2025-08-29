function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join meeting room
    socket.on('join_meeting', (meetingId) => {
      socket.join(meetingId);
      console.log(`Socket ${socket.id} joined meeting ${meetingId}`);
    });

    // Leave meeting room
    socket.on('leave_meeting', (meetingId) => {
      socket.leave(meetingId);
      console.log(`Socket ${socket.id} left meeting ${meetingId}`);
    });

    // Handle WebRTC signaling
    socket.on('webrtc_signal', (data) => {
      const { meetingId, signal, targetParticipant } = data;
      
      if (targetParticipant) {
        socket.to(targetParticipant).emit('webrtc_signal', {
          signal,
          from: socket.id
        });
      } else {
        socket.to(meetingId).emit('webrtc_signal', {
          signal,
          from: socket.id
        });
      }
    });

    // Handle chat messages
    socket.on('chat_message', (data) => {
      const { meetingId, message, participantName } = data;
      
      io.to(meetingId).emit('chat_message', {
        message,
        participantName,
        timestamp: new Date(),
        participantId: socket.id
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = { setupSocketHandlers };