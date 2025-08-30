// const jwt = require('jsonwebtoken');
// const WebSocket = require('ws');

// // Store active connections and their subscriptions
// const connections = new Map();
// const subscriptions = new Map(); // channel -> Set of connection IDs
// const meetingParticipants = new Map(); // meetingId -> Set of participant data

// function setupWebSocketHandlers(wss) {
//   wss.on('connection', (ws, req) => {
//     const connectionId = generateConnectionId();
//     console.log(`New WebSocket connection: ${connectionId}`);
    
//     // Store connection
//     connections.set(connectionId, {
//       ws,
//       authenticated: false,
//       userId: null,
//       channels: new Set(),
//       joinedAt: Date.now()
//     });

//     // Set up message handler
//     ws.on('message', (data) => {
//       try {
//         const message = JSON.parse(data);
//         handleMessage(connectionId, message);
//       } catch (error) {
//         console.error('Failed to parse WebSocket message:', error);
//         sendError(connectionId, 'Invalid message format');
//       }
//     });

//     // Handle connection close
//     ws.on('close', (code, reason) => {
//       console.log(`WebSocket connection closed: ${connectionId}`, code, reason.toString());
//       handleDisconnection(connectionId);
//     });

//     // Handle connection error
//     ws.on('error', (error) => {
//       console.error(`WebSocket error for ${connectionId}:`, error);
//       handleDisconnection(connectionId);
//     });

//     // Send initial connection confirmation
//     sendMessage(connectionId, {
//       type: 'connection_established',
//       connectionId
//     });
//   });

//   console.log('WebSocket handlers initialized');
// }

// function handleMessage(connectionId, message) {
//   const connection = connections.get(connectionId);
//   if (!connection) return;

//   const { type, channel, data } = message;

//   switch (type) {
//     case 'auth':
//       handleAuthentication(connectionId, message);
//       break;
    
//     case 'subscribe':
//       handleSubscription(connectionId, channel);
//       break;
    
//     case 'unsubscribe':
//       handleUnsubscription(connectionId, channel);
//       break;
    
//     case 'ping':
//       sendMessage(connectionId, { type: 'pong' });
//       break;
    
//     case 'webrtc_signal':
//       handleWebRTCSignal(connectionId, message);
//       break;
    
//     case 'participant_joined':
//     case 'participant_left':
//     case 'participant_updated':
//       handleParticipantEvent(connectionId, message);
//       break;
    
//     case 'screen_share_started':
//     case 'screen_share_stopped':
//       handleScreenShareEvent(connectionId, message);
//       break;
    
//     case 'participant_kicked':
//       handleParticipantKick(connectionId, message);
//       break;

//     case 'meeting_message':
//       handleMeetingMessage(connectionId, message);
//       break;
    
//     default:
//       console.warn(`Unknown message type: ${type}`);
//   }
// }

// async function handleAuthentication(connectionId, message) {
//   try {
//     // For demo purposes, we'll accept any connection
//     // In production, you'd verify JWT from cookies here
//     const connection = connections.get(connectionId);
//     if (connection) {
//       connection.authenticated = true;
//       connection.userId = `user_${connectionId}`;
      
//       sendMessage(connectionId, {
//         type: 'auth_response',
//         success: true,
//         userId: connection.userId
//       });

//       console.log(`Connection ${connectionId} authenticated`);
//     }
//   } catch (error) {
//     console.error('Authentication failed:', error);
//     sendMessage(connectionId, {
//       type: 'auth_response',
//       error: 'Authentication failed'
//     });
//   }
// }

// function handleSubscription(connectionId, channel) {
//   const connection = connections.get(connectionId);
//   if (!connection || !connection.authenticated) {
//     sendError(connectionId, 'Not authenticated');
//     return;
//   }

//   // Add to subscriptions
//   if (!subscriptions.has(channel)) {
//     subscriptions.set(channel, new Set());
//   }
//   subscriptions.get(channel).add(connectionId);
//   connection.channels.add(channel);

//   sendMessage(connectionId, {
//     type: 'subscription_confirmed',
//     channel
//   });

//   console.log(`Connection ${connectionId} subscribed to ${channel}`);

//   // Send current meeting state if subscribing to a meeting channel
//   if (channel.includes(':participants')) {
//     const meetingId = channel.split(':')[1];
//     const participants = getMeetingParticipants(meetingId);
//     if (participants.length > 0) {
//       sendMessage(connectionId, {
//         type: 'current_participants',
//         channel,
//         data: participants
//       });
//     }
//   }
// }

// function handleUnsubscription(connectionId, channel) {
//   const connection = connections.get(connectionId);
//   if (!connection) return;

//   // Remove from subscriptions
//   const channelSubscriptions = subscriptions.get(channel);
//   if (channelSubscriptions) {
//     channelSubscriptions.delete(connectionId);
//     if (channelSubscriptions.size === 0) {
//       subscriptions.delete(channel);
//     }
//   }
//   connection.channels.delete(channel);

//   sendMessage(connectionId, {
//     type: 'unsubscription_confirmed',
//     channel
//   });

//   console.log(`Connection ${connectionId} unsubscribed from ${channel}`);
// }

// function handleWebRTCSignal(connectionId, message) {
//   const { meetingId, signal, targetParticipantId } = message;
  
//   // Broadcast WebRTC signal to specific participant or all participants in the meeting
//   const channel = `meeting:${meetingId}:webrtc`;
  
//   if (targetParticipantId) {
//     // Send to specific participant
//     const targetConnection = findParticipantConnection(meetingId, targetParticipantId);
//     if (targetConnection) {
//       sendMessage(targetConnection, {
//         type: 'webrtc_signal',
//         signal,
//         fromParticipantId: connectionId,
//         channel
//       });
//     }
//   } else {
//     // Broadcast to all participants
//     broadcastToChannel(channel, {
//       type: 'webrtc_signal',
//       signal,
//       fromParticipantId: connectionId
//     }, connectionId);
//   }
// }

// function handleParticipantEvent(connectionId, message) {
//   const { meetingId, participantId, data } = message;
//   const channel = `meeting:${meetingId}:participants`;
  
//   // Update meeting participants
//   if (message.type === 'participant_joined') {
//     if (!meetingParticipants.has(meetingId)) {
//       meetingParticipants.set(meetingId, new Set());
//     }
//     meetingParticipants.get(meetingId).add({
//       id: participantId,
//       connectionId,
//       ...data
//     });
//   } else if (message.type === 'participant_left') {
//     const participants = meetingParticipants.get(meetingId);
//     if (participants) {
//       participants.forEach(p => {
//         if (p.id === participantId || p.connectionId === connectionId) {
//           participants.delete(p);
//         }
//       });
//     }
//   }

//   // Broadcast to all participants in the meeting
//   broadcastToChannel(channel, {
//     type: message.type,
//     participantId,
//     data
//   }, connectionId);
// }

// function handleScreenShareEvent(connectionId, message) {
//   const { meetingId, participantId } = message;
//   const channel = `meeting:${meetingId}:events`;
  
//   broadcastToChannel(channel, {
//     type: message.type,
//     data: { participantId }
//   }, connectionId);
// }

// function handleParticipantKick(connectionId, message) {
//   const { meetingId, participantId } = message;
  
//   // Find the connection of the participant to be kicked
//   const targetConnection = Array.from(connections.values()).find(conn => 
//     conn.userId === participantId || conn.connectionId === participantId
//   );
  
//   if (targetConnection) {
//     // Send kick notification to the target participant
//     sendMessage(getConnectionIdFromConnection(targetConnection), {
//       type: 'participant_kicked',
//       reason: 'Removed from meeting by host'
//     });
    
//     // Close their connection after a brief delay
//     setTimeout(() => {
//       targetConnection.ws.close(1000, 'Kicked from meeting');
//     }, 1000);
//   }
  
//   // Broadcast to other participants
//   const channel = `meeting:${meetingId}:participants`;
//   broadcastToChannel(channel, {
//     type: 'participant_left',
//     participantId,
//     data: { reason: 'kicked' }
//   }, connectionId);
// }

// function handleMeetingMessage(connectionId, message) {
//   const { meetingId, data } = message;
//   const channel = `meeting:${meetingId}:chat`;
  
//   // Broadcast chat message to all participants
//   broadcastToChannel(channel, {
//     type: 'chat_message',
//     data: {
//       ...data,
//       timestamp: Date.now(),
//       connectionId
//     }
//   }, connectionId);
// }

// function broadcastToChannel(channel, message, excludeConnectionId = null) {
//   const channelSubscriptions = subscriptions.get(channel);
//   if (!channelSubscriptions) return;

//   const messageStr = JSON.stringify({
//     ...message,
//     channel,
//     timestamp: Date.now()
//   });

//   channelSubscriptions.forEach(connId => {
//     if (connId !== excludeConnectionId) {
//       const connection = connections.get(connId);
//       if (connection && connection.ws.readyState === WebSocket.OPEN) {
//         try {
//           connection.ws.send(messageStr);
//         } catch (error) {
//           console.error(`Failed to send message to ${connId}:`, error);
//           // Clean up dead connection
//           handleDisconnection(connId);
//         }
//       }
//     }
//   });
// }

// function sendMessage(connectionId, message) {
//   const connection = connections.get(connectionId);
//   if (connection && connection.ws.readyState === WebSocket.OPEN) {
//     try {
//       connection.ws.send(JSON.stringify({
//         ...message,
//         timestamp: Date.now()
//       }));
//       return true;
//     } catch (error) {
//       console.error(`Failed to send message to ${connectionId}:`, error);
//       handleDisconnection(connectionId);
//       return false;
//     }
//   }
//   return false;
// }

// function sendError(connectionId, errorMessage) {
//   sendMessage(connectionId, {
//     type: 'error',
//     error: errorMessage
//   });
// }

// function handleDisconnection(connectionId) {
//   const connection = connections.get(connectionId);
//   if (!connection) return;

//   console.log(`Cleaning up connection: ${connectionId}`);

//   // Remove from all channel subscriptions
//   connection.channels.forEach(channel => {
//     const channelSubscriptions = subscriptions.get(channel);
//     if (channelSubscriptions) {
//       channelSubscriptions.delete(connectionId);
//       if (channelSubscriptions.size === 0) {
//         subscriptions.delete(channel);
//       }
//     }
//   });

//   // Remove from meeting participants
//   meetingParticipants.forEach((participants, meetingId) => {
//     participants.forEach(participant => {
//       if (participant.connectionId === connectionId) {
//         participants.delete(participant);
        
//         // Notify other participants
//         broadcastToChannel(`meeting:${meetingId}:participants`, {
//           type: 'participant_left',
//           participantId: participant.id,
//           data: { reason: 'disconnected' }
//         });
//       }
//     });
//   });

//   // Remove connection
//   connections.delete(connectionId);
// }

// function generateConnectionId() {
//   return 'conn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
// }

// function getConnectionIdFromConnection(targetConnection) {
//   for (const [connId, conn] of connections.entries()) {
//     if (conn === targetConnection) {
//       return connId;
//     }
//   }
//   return null;
// }

// function findParticipantConnection(meetingId, participantId) {
//   const participants = meetingParticipants.get(meetingId);
//   if (!participants) return null;
  
//   for (const participant of participants) {
//     if (participant.id === participantId) {
//       return participant.connectionId;
//     }
//   }
//   return null;
// }

// // Utility functions for external use
// function broadcastToMeeting(meetingId, message, excludeConnectionId = null) {
//   const channel = `meeting:${meetingId}:events`;
//   broadcastToChannel(channel, message, excludeConnectionId);
// }

// function getActiveConnections() {
//   return connections.size;
// }

// function getMeetingParticipants(meetingId) {
//   return Array.from(meetingParticipants.get(meetingId) || []);
// }

// function notifyParticipantJoined(meetingId, participantData) {
//   const channel = `meeting:${meetingId}:participants`;
//   broadcastToChannel(channel, {
//     type: 'participant_joined',
//     participantId: participantData.id,
//     data: participantData
//   });
// }

// function notifyParticipantLeft(meetingId, participantId, reason = 'disconnected') {
//   const channel = `meeting:${meetingId}:participants`;
//   broadcastToChannel(channel, {
//     type: 'participant_left',
//     participantId,
//     data: { reason }
//   });
// }

// // Periodic cleanup of dead connections
// setInterval(() => {
//   connections.forEach((connection, connectionId) => {
//     if (connection.ws.readyState === WebSocket.CLOSED || 
//         connection.ws.readyState === WebSocket.CLOSING) {
//       handleDisconnection(connectionId);
//     }
//   });
// }, 30000); // Clean up every 30 seconds

// module.exports = {
//   setupWebSocketHandlers,
//   broadcastToMeeting,
//   getActiveConnections,
//   getMeetingParticipants,
//   sendMessage,
//   broadcastToChannel,
//   notifyParticipantJoined,
//   notifyParticipantLeft
// };





















const { WebSocket } = require('ws');

// Store active connections and their subscriptions
const connections = new Map();
const subscriptions = new Map(); // channel -> Set of connection IDs
const meetingParticipants = new Map(); // meetingId -> Set of participant data

function setupWebSocketHandlers(wss) {
  wss.on('connection', (ws, req) => {
    const connectionId = generateConnectionId();
    console.log(`✅ New WebSocket connection: ${connectionId}`);
    
    // Store connection
    connections.set(connectionId, {
      ws,
      authenticated: false,
      userId: null,
      channels: new Set(),
      joinedAt: Date.now()
    });

    // Set up message handler
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        handleMessage(connectionId, message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        sendError(connectionId, 'Invalid message format');
      }
    });

    // Handle connection close
    ws.on('close', (code, reason) => {
      console.log(`🔌 WebSocket connection closed: ${connectionId}`, code, reason ? reason.toString() : 'No reason');
      handleDisconnection(connectionId);
    });

    // Handle connection error
    ws.on('error', (error) => {
      console.error(`❌ WebSocket error for ${connectionId}:`, error);
      handleDisconnection(connectionId);
    });

    // Send initial connection confirmation
    sendMessage(connectionId, {
      type: 'connection_established',
      connectionId
    });
  });

  console.log('✅ WebSocket handlers initialized');
}

function handleMessage(connectionId, message) {
  const connection = connections.get(connectionId);
  if (!connection) return;

  const { type, channel, data } = message;

  switch (type) {
    case 'auth':
      handleAuthentication(connectionId, message);
      break;
    
    case 'subscribe':
      handleSubscription(connectionId, channel);
      break;
    
    case 'unsubscribe':
      handleUnsubscription(connectionId, channel);
      break;
    
    case 'ping':
      sendMessage(connectionId, { type: 'pong' });
      break;
    
    case 'webrtc_signal':
      handleWebRTCSignal(connectionId, message);
      break;
    
    case 'participant_joined':
    case 'participant_left':
    case 'participant_updated':
      handleParticipantEvent(connectionId, message);
      break;
    
    case 'screen_share_started':
    case 'screen_share_stopped':
      handleScreenShareEvent(connectionId, message);
      break;
    
    case 'participant_kicked':
      handleParticipantKick(connectionId, message);
      break;

    case 'meeting_message':
      handleMeetingMessage(connectionId, message);
      break;
    
    default:
      console.warn(`⚠️ Unknown message type: ${type}`);
  }
}

async function handleAuthentication(connectionId, message) {
  try {
    const connection = connections.get(connectionId);
    if (connection) {
      connection.authenticated = true;
      connection.userId = message.userId || `user_${connectionId}`;
      
      sendMessage(connectionId, {
        type: 'auth_response',
        success: true,
        userId: connection.userId
      });

      console.log(`✅ Connection ${connectionId} authenticated as ${connection.userId}`);
    }
  } catch (error) {
    console.error('Authentication failed:', error);
    sendMessage(connectionId, {
      type: 'auth_response',
      error: 'Authentication failed'
    });
  }
}

function handleSubscription(connectionId, channel) {
  const connection = connections.get(connectionId);
  if (!connection || !connection.authenticated) {
    sendError(connectionId, 'Not authenticated');
    return;
  }

  // Add to subscriptions
  if (!subscriptions.has(channel)) {
    subscriptions.set(channel, new Set());
  }
  subscriptions.get(channel).add(connectionId);
  connection.channels.add(channel);

  sendMessage(connectionId, {
    type: 'subscription_confirmed',
    channel
  });

  console.log(`📡 Connection ${connectionId} subscribed to ${channel}`);

  // Send current meeting state if subscribing to a meeting channel
  if (channel.includes(':participants')) {
    const meetingId = channel.split(':')[1];
    const participants = getMeetingParticipants(meetingId);
    if (participants.length > 0) {
      sendMessage(connectionId, {
        type: 'current_participants',
        channel,
        data: participants
      });
    }
  }
}

function handleUnsubscription(connectionId, channel) {
  const connection = connections.get(connectionId);
  if (!connection) return;

  // Remove from subscriptions
  const channelSubscriptions = subscriptions.get(channel);
  if (channelSubscriptions) {
    channelSubscriptions.delete(connectionId);
    if (channelSubscriptions.size === 0) {
      subscriptions.delete(channel);
    }
  }
  connection.channels.delete(channel);

  sendMessage(connectionId, {
    type: 'unsubscription_confirmed',
    channel
  });

  console.log(`📡 Connection ${connectionId} unsubscribed from ${channel}`);
}

function handleWebRTCSignal(connectionId, message) {
  const { meetingId, signal, targetParticipantId } = message;
  
  const channel = `meeting:${meetingId}:webrtc`;
  
  if (targetParticipantId) {
    // Send to specific participant
    const targetConnection = findParticipantConnection(meetingId, targetParticipantId);
    if (targetConnection) {
      sendMessage(targetConnection, {
        type: 'webrtc_signal',
        signal,
        fromParticipantId: connectionId,
        channel
      });
    }
  } else {
    // Broadcast to all participants
    broadcastToChannel(channel, {
      type: 'webrtc_signal',
      signal,
      fromParticipantId: connectionId
    }, connectionId);
  }
}

function handleParticipantEvent(connectionId, message) {
  const { meetingId, participantId, data } = message;
  const channel = `meeting:${meetingId}:participants`;
  
  // Update meeting participants
  if (message.type === 'participant_joined') {
    if (!meetingParticipants.has(meetingId)) {
      meetingParticipants.set(meetingId, new Set());
    }
    meetingParticipants.get(meetingId).add({
      id: participantId,
      connectionId,
      ...data
    });
    
    console.log(`👤 Participant ${participantId} joined meeting ${meetingId}`);
  } else if (message.type === 'participant_left') {
    const participants = meetingParticipants.get(meetingId);
    if (participants) {
      participants.forEach(p => {
        if (p.id === participantId || p.connectionId === connectionId) {
          participants.delete(p);
        }
      });
    }
    
    console.log(`👤 Participant ${participantId} left meeting ${meetingId}`);
  }

  // Broadcast to all participants in the meeting
  broadcastToChannel(channel, {
    type: message.type,
    participantId,
    data
  }, connectionId);
}

function handleScreenShareEvent(connectionId, message) {
  const { meetingId, participantId } = message;
  const channel = `meeting:${meetingId}:events`;
  
  broadcastToChannel(channel, {
    type: message.type,
    data: { participantId }
  }, connectionId);
}

function handleParticipantKick(connectionId, message) {
  const { meetingId, participantId } = message;
  
  // Find the connection of the participant to be kicked
  const targetConnection = Array.from(connections.values()).find(conn => 
    conn.userId === participantId || conn.connectionId === participantId
  );
  
  if (targetConnection) {
    // Send kick notification to the target participant
    sendMessage(getConnectionIdFromConnection(targetConnection), {
      type: 'participant_kicked',
      reason: 'Removed from meeting by host'
    });
    
    // Close their connection after a brief delay
    setTimeout(() => {
      targetConnection.ws.close(1000, 'Kicked from meeting');
    }, 1000);
  }
  
  // Broadcast to other participants
  const channel = `meeting:${meetingId}:participants`;
  broadcastToChannel(channel, {
    type: 'participant_left',
    participantId,
    data: { reason: 'kicked' }
  }, connectionId);
}

function handleMeetingMessage(connectionId, message) {
  const { meetingId, data } = message;
  const channel = `meeting:${meetingId}:chat`;
  
  // Broadcast chat message to all participants
  broadcastToChannel(channel, {
    type: 'chat_message',
    data: {
      ...data,
      timestamp: Date.now(),
      connectionId
    }
  }, connectionId);
}

function broadcastToChannel(channel, message, excludeConnectionId = null) {
  const channelSubscriptions = subscriptions.get(channel);
  if (!channelSubscriptions) return;

  const messageStr = JSON.stringify({
    ...message,
    channel,
    timestamp: Date.now()
  });

  let sentCount = 0;
  channelSubscriptions.forEach(connId => {
    if (connId !== excludeConnectionId) {
      const connection = connections.get(connId);
      if (connection && connection.ws.readyState === WebSocket.OPEN) {
        try {
          connection.ws.send(messageStr);
          sentCount++;
        } catch (error) {
          console.error(`Failed to send message to ${connId}:`, error);
          handleDisconnection(connId);
        }
      }
    }
  });

  console.log(`📡 Broadcasted to ${sentCount} connections on channel ${channel}`);
}

function sendMessage(connectionId, message) {
  const connection = connections.get(connectionId);
  if (connection && connection.ws.readyState === WebSocket.OPEN) {
    try {
      connection.ws.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
      return true;
    } catch (error) {
      console.error(`Failed to send message to ${connectionId}:`, error);
      handleDisconnection(connectionId);
      return false;
    }
  }
  return false;
}

function sendError(connectionId, errorMessage) {
  sendMessage(connectionId, {
    type: 'error',
    error: errorMessage
  });
}

function handleDisconnection(connectionId) {
  const connection = connections.get(connectionId);
  if (!connection) return;

  console.log(`🧹 Cleaning up connection: ${connectionId}`);

  // Remove from all channel subscriptions
  connection.channels.forEach(channel => {
    const channelSubscriptions = subscriptions.get(channel);
    if (channelSubscriptions) {
      channelSubscriptions.delete(connectionId);
      if (channelSubscriptions.size === 0) {
        subscriptions.delete(channel);
      }
    }
  });

  // Remove from meeting participants and notify others
  meetingParticipants.forEach((participants, meetingId) => {
    participants.forEach(participant => {
      if (participant.connectionId === connectionId) {
        participants.delete(participant);
        
        // Notify other participants
        broadcastToChannel(`meeting:${meetingId}:participants`, {
          type: 'participant_left',
          participantId: participant.id,
          data: { reason: 'disconnected' }
        });
        
        console.log(`👤 Participant ${participant.id} removed from meeting ${meetingId} due to disconnection`);
      }
    });
  });

  // Remove connection
  connections.delete(connectionId);
}

function generateConnectionId() {
  return 'conn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getConnectionIdFromConnection(targetConnection) {
  for (const [connId, conn] of connections.entries()) {
    if (conn === targetConnection) {
      return connId;
    }
  }
  return null;
}

function findParticipantConnection(meetingId, participantId) {
  const participants = meetingParticipants.get(meetingId);
  if (!participants) return null;
  
  for (const participant of participants) {
    if (participant.id === participantId) {
      return participant.connectionId;
    }
  }
  return null;
}

// Utility functions for external use
function broadcastToMeeting(meetingId, message, excludeConnectionId = null) {
  const channel = `meeting:${meetingId}:events`;
  broadcastToChannel(channel, message, excludeConnectionId);
}

function getActiveConnections() {
  return connections.size;
}

function getMeetingParticipants(meetingId) {
  return Array.from(meetingParticipants.get(meetingId) || []);
}

function notifyParticipantJoined(meetingId, participantData) {
  const channel = `meeting:${meetingId}:participants`;
  broadcastToChannel(channel, {
    type: 'participant_joined',
    participantId: participantData.id,
    data: participantData
  });
  
  console.log(`📢 Notified participant joined: ${participantData.name} in meeting ${meetingId}`);
}

function notifyParticipantLeft(meetingId, participantId, reason = 'disconnected') {
  const channel = `meeting:${meetingId}:participants`;
  broadcastToChannel(channel, {
    type: 'participant_left',
    participantId,
    data: { reason }
  });
  
  console.log(`📢 Notified participant left: ${participantId} from meeting ${meetingId}`);
}

// Periodic cleanup of dead connections
setInterval(() => {
  let cleanedCount = 0;
  connections.forEach((connection, connectionId) => {
    if (connection.ws.readyState === WebSocket.CLOSED || 
        connection.ws.readyState === WebSocket.CLOSING) {
      handleDisconnection(connectionId);
      cleanedCount++;
    }
  });
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} dead connections`);
  }
}, 30000); // Clean up every 30 seconds

module.exports = {
  setupWebSocketHandlers,
  broadcastToMeeting,
  getActiveConnections,
  getMeetingParticipants,
  sendMessage,
  broadcastToChannel,
  notifyParticipantJoined,
  notifyParticipantLeft
};