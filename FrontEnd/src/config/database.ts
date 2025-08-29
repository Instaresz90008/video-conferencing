

// PostgreSQL Database Configuration
export const DATABASE_CONFIG = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_DB_PORT || '5432'),
  database: import.meta.env.VITE_DB_NAME || 'meeting_app',
  username: import.meta.env.VITE_DB_USER || 'postgres',
  password: import.meta.env.VITE_DB_PASSWORD || 'your_password',
  ssl: import.meta.env.PROD || false
};

export const WEBSOCKET_CONFIG = {
  url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
  reconnectInterval: 3000,
  maxReconnectAttempts: 10
};

// Database Tables Schema (PostgreSQL)
export const DB_TABLES = {
  users: 'users',
  meetings: 'meetings', 
  participants: 'meeting_participants',
  messages: 'chat_messages',
  attachments: 'message_attachments',
  recordings: 'meeting_recordings'
};

