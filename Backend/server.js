require('dotenv').config();
const app = require('./src/app');
// const { initializeDatabase } = require('./src/config/database');
const http = require('http');
const { Server } = require('socket.io');
const { setupSocketHandlers } = require('./src/sockets/socketHandlers');
const { corsConfig } = require('./src/config/cors');

const server = http.createServer(app);
const io = new Server(server, { cors: corsConfig.socket });

// Setup socket handlers
setupSocketHandlers(io);

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // await initializeDatabase();
    
    server.listen(PORT, () => {
      console.log(`Meeting server running on port ${PORT}`);
      console.log(`CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:8080"}`);
      console.log(`WebSocket server ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server, io };