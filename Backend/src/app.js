const express = require('express');
const cookieParser = require('cookie-parser');
const { corsConfig } = require('./config/cors');
const authRoutes = require('./routes/auth');
const meetingRoutes = require('./routes/meetings');

const app = express();

// Middleware
app.use(corsConfig.express);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;