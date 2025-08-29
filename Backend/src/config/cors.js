const cors = require('cors');

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

const corsConfig = {
  express: cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  }),
  
  socket: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
};

module.exports = { corsConfig, FRONTEND_URL };