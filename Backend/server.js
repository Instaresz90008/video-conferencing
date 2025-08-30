// require('dotenv').config();
// const app = require('./src/app');
// const http = require('http');
// const WebSocket = require('ws');
// const url = require('url');
// const { setupWebSocketHandlers } = require('./src/sockets/webSocketHandlers');

// const server = http.createServer(app);

// // Create WebSocket server
// const wss = new WebSocket.Server({ 
//   server,
//   path: '/ws',
//   verifyClient: (info) => {
//     // Optional: Add origin verification here
//     const origin = info.origin;
//     const allowedOrigins = [
//       'http://localhost:8080',
//       'http://localhost:3000',
//       process.env.FRONTEND_URL
//     ].filter(Boolean);
    
//     return !origin || allowedOrigins.includes(origin);
//   }
// });

// // Setup WebSocket handlers
// setupWebSocketHandlers(wss);

// const PORT = process.env.PORT || 4000;

// async function startServer() {
//   try {
//     server.listen(PORT, () => {
//       console.log(`Meeting server running on port ${PORT}`);
//       console.log(`CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:8080"}`);
//       console.log(`WebSocket server ready at ws://localhost:${PORT}/ws`);
//     });
//   } catch (error) {
//     console.error('Failed to start server:', error);
//     process.exit(1);
//   }
// }

// startServer();

// module.exports = { app, server, wss };















require('dotenv').config();
const app = require('./src/app');
const http = require('http');
const WebSocket = require('ws');
const { setupWebSocketHandlers } = require('./src/sockets/webSocketHandlers');

const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  path: '/ws',
  verifyClient: (info) => {
    // Verify origin for security
    const origin = info.origin;
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:5173', // Vite default
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    console.log(`WebSocket connection attempt from origin: ${origin}`);
    return !origin || allowedOrigins.includes(origin);
  }
});

// Setup WebSocket handlers
setupWebSocketHandlers(wss);

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    server.listen(PORT, () => {
      console.log(`Meeting server running on port ${PORT}`);
      console.log(`CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:8080"}`);
      console.log(`WebSocket server ready at ws://localhost:${PORT}/ws`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server, wss };