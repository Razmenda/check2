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
import { createAdminUser, createDemoUsers } from './seedAdmin.js';

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
    console.log(`📁 Created directory: ${dir}`);
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
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
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
      },
      adminCredentials: {
        email: 'admin@chekawak.com',
        password: 'admin123'
      },
      demoCredentials: {
        email: 'john@example.com',
        password: 'demo123'
      }
    });
  });
}

const PORT = process.env.PORT || 5000;

// Initialize database and start server with proper error handling
async function startServer() {
  try {
    console.log('🔄 Starting Chekawak Messenger Server...');
    console.log('🔗 Connecting to database...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    console.log('🔄 Synchronizing database...');
    
    // Force recreate database to fix constraint issues
    await sequelize.sync({ 
      force: true, // This will drop and recreate all tables
      logging: false
    });
    
    console.log('✅ Database synchronized successfully.');

    // Create admin user and demo users
    console.log('👤 Setting up users...');
    await createAdminUser();
    await createDemoUsers();

    server.listen(PORT, '0.0.0.0', () => {
      console.log('\n🚀 Chekawak Messenger Server Started Successfully!');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: ${process.env.DB_PATH || './database.sqlite'}`);
      console.log('\n👨‍💼 Admin Credentials:');
      console.log('📧 Email: admin@chekawak.com');
      console.log('🔑 Password: admin123');
      console.log('\n👥 Demo User Credentials:');
      console.log('📧 Email: john@example.com');
      console.log('🔑 Password: demo123');
      console.log('\n🔗 API Endpoints:');
      console.log(`   Auth: http://localhost:${PORT}/api/auth`);
      console.log(`   Users: http://localhost:${PORT}/api/users`);
      console.log(`   Chats: http://localhost:${PORT}/api/chats`);
      console.log(`   Messages: http://localhost:${PORT}/api/messages`);
      console.log(`   Calls: http://localhost:${PORT}/api/calls`);
      console.log(`   Stories: http://localhost:${PORT}/api/stories`);
      console.log('\n✨ Ready to accept connections!');
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    
    if (error.name === 'SequelizeConnectionError') {
      console.error('💥 Database connection failed. Check your database configuration.');
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error('💥 Database error:', error.message);
      console.log('🔄 Attempting to reset database...');
      
      // Try to reset database
      try {
        await sequelize.sync({ force: true, logging: false });
        console.log('✅ Database reset successfully. Restarting...');
        return startServer();
      } catch (resetError) {
        console.error('❌ Failed to reset database:', resetError);
      }
    }
    
    process.exit(1);
  }
}

// Enhanced error handling
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  try {
    await sequelize.close();
    console.log('✅ Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('💥 Uncaught Exception:', error);
  
  // If it's a database constraint error, try to reset
  if (error.message.includes('UNIQUE constraint failed') || error.message.includes('constraint')) {
    console.log('🔄 Database constraint error detected. Resetting database...');
    try {
      await sequelize.sync({ force: true, logging: false });
      console.log('✅ Database reset successfully.');
      return;
    } catch (resetError) {
      console.error('❌ Failed to reset database:', resetError);
    }
  }
  
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  
  // Don't exit on unhandled rejections in development
  if (process.env.NODE_ENV !== 'development') {
    process.exit(1);
  }
});

startServer();