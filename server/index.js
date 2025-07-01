import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { sequelize } from './models/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chats.js';
import messageRoutes from './routes/messages.js';
import callRoutes from './routes/calls.js';
import storyRoutes from './routes/stories.js';
import { authenticateSocket } from './middleware/auth.js';
import { handleSocketConnection } from './socket/socketHandlers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, '../uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const storiesDir = path.join(uploadsDir, 'stories');

[uploadsDir, avatarsDir, storiesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/stories', storyRoutes);

// Socket.IO authentication middleware
io.use(authenticateSocket);

// Socket.IO connection handling
io.on('connection', (socket) => {
  handleSocketConnection(socket, io);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
} else {
  // Development route
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Chekawak Messenger API Server',
      status: 'running',
      environment: 'development',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        chats: '/api/chats',
        messages: '/api/messages',
        calls: '/api/calls',
        stories: '/api/stories'
      }
    });
  });
}

const PORT = process.env.PORT || 5000;

// Initialize database and start server
async function startServer() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    console.log('Synchronizing database...');
    // Use force: false and alter: true for development, force: false for production
    await sequelize.sync({ 
      force: false, // Never drop tables
      alter: process.env.NODE_ENV === 'development' // Only alter in development
    });
    console.log('Database synchronized successfully.');

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('Database tables created successfully');
      console.log('Upload directories created successfully');
      console.log(`Database file: ${process.env.DB_PATH || './database.sqlite'}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    
    // More detailed error logging
    if (error.name === 'SequelizeConnectionError') {
      console.error('Database connection failed. Check your database configuration.');
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error('Database error:', error.message);
    }
    
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  try {
    await sequelize.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();