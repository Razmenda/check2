import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { sequelize, testConnection, syncDatabase, healthCheck } from './models/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chats.js';
import messageRoutes from './routes/messages.js';
import callRoutes from './routes/calls.js';
import storyRoutes from './routes/stories.js';
import { authenticateSocket } from './middleware/auth.js';
import { handleSocketConnection } from './socket/socketHandlers.js';
import { createAdminUser, createDemoUsers } from './seedAdmin.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || false 
      : ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Enhanced directory creation with proper error handling
const createDirectories = () => {
  const directories = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../uploads/avatars'),
    path.join(__dirname, '../uploads/stories'),
    path.join(__dirname, '../uploads/files'),
    path.join(__dirname, '../uploads/voice')
  ];

  directories.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create directory ${dir}:`, error);
    }
  });
};

// Initialize directories
createDirectories();

// Enhanced middleware configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || false 
    : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving with proper headers
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    res.json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: dbHealth,
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes with error handling middleware
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/stories', storyRoutes);

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error);
  
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: error.errors.map(e => e.message)
    });
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Duplicate entry',
      field: error.errors[0]?.path
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Socket.IO with enhanced error handling
io.use(authenticateSocket);

io.on('connection', (socket) => {
  try {
    handleSocketConnection(socket, io);
  } catch (error) {
    console.error('❌ Socket connection error:', error);
    socket.emit('error', { message: 'Connection failed' });
    socket.disconnect();
  }
});

// Enhanced error handling for Socket.IO
io.engine.on('connection_error', (err) => {
  console.error('❌ Socket.IO connection error:', err);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
} else {
  // Development route with comprehensive API info
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Chekawak Messenger API Server',
      status: 'running',
      environment: 'development',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        chats: '/api/chats',
        messages: '/api/messages',
        calls: '/api/calls',
        stories: '/api/stories',
        health: '/health'
      },
      credentials: {
        admin: {
          email: 'admin@chekawak.com',
          password: 'admin123'
        },
        demo: {
          email: 'john@example.com',
          password: 'demo123'
        }
      },
      features: [
        'Real-time messaging',
        'Voice messages',
        'Story system',
        'File sharing',
        'Video calls',
        'Message reactions',
        'Read receipts',
        'Typing indicators'
      ]
    });
  });
}

const PORT = process.env.PORT || 5000;

// Enhanced server startup with comprehensive error handling
async function startServer() {
  try {
    console.log('\n🚀 Starting Chekawak Messenger Server...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 Port: ${PORT}`);
    
    // Test database connection
    console.log('🔗 Testing database connection...');
    await testConnection();
    
    // Synchronize database with recovery mechanism
    console.log('🔄 Synchronizing database...');
    try {
      await syncDatabase({ force: false });
    } catch (syncError) {
      console.log('⚠️  Initial sync failed, attempting recovery...');
      await syncDatabase({ force: true });
    }
    
    // Create default users
    console.log('👤 Setting up default users...');
    await createAdminUser();
    await createDemoUsers();
    
    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      console.log('\n✅ Chekawak Messenger Server Started Successfully!');
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`📡 Socket.IO: Ready for connections`);
      console.log(`💾 Database: SQLite (${process.env.DB_PATH || './database.sqlite'})`);
      
      console.log('\n🔐 Login Credentials:');
      console.log('┌─────────────────────────────────────┐');
      console.log('│ 👨‍💼 ADMIN USER                      │');
      console.log('│ Email: admin@chekawak.com           │');
      console.log('│ Password: admin123                  │');
      console.log('├─────────────────────────────────────┤');
      console.log('│ 👤 DEMO USER                        │');
      console.log('│ Email: john@example.com             │');
      console.log('│ Password: demo123                   │');
      console.log('└─────────────────────────────────────┘');
      
      console.log('\n🔗 API Endpoints:');
      console.log(`   Health Check: http://localhost:${PORT}/health`);
      console.log(`   Authentication: http://localhost:${PORT}/api/auth`);
      console.log(`   Users: http://localhost:${PORT}/api/users`);
      console.log(`   Chats: http://localhost:${PORT}/api/chats`);
      console.log(`   Messages: http://localhost:${PORT}/api/messages`);
      console.log(`   Calls: http://localhost:${PORT}/api/calls`);
      console.log(`   Stories: http://localhost:${PORT}/api/stories`);
      
      console.log('\n🎯 Features Available:');
      console.log('   ✅ Real-time messaging with Socket.IO');
      console.log('   ✅ Voice messages with waveform');
      console.log('   ✅ Story system with media support');
      console.log('   ✅ File and image sharing');
      console.log('   ✅ Message reactions and replies');
      console.log('   ✅ Read receipts and typing indicators');
      console.log('   ✅ Group chats and calls');
      console.log('   ✅ User presence and status');
      
      console.log('\n🚀 Ready to accept connections!');
    });
    
  } catch (error) {
    console.error('\n❌ Failed to start server:', error);
    
    // Enhanced error diagnosis
    if (error.message.includes('EADDRINUSE')) {
      console.error(`💥 Port ${PORT} is already in use. Please use a different port.`);
    } else if (error.message.includes('EACCES')) {
      console.error('💥 Permission denied. Try running with sudo or use a port > 1024.');
    } else if (error.message.includes('database')) {
      console.error('💥 Database error. Attempting to reset database...');
      try {
        await syncDatabase({ force: true });
        console.log('✅ Database reset successful. Restarting...');
        return startServer();
      } catch (resetError) {
        console.error('❌ Database reset failed:', resetError);
      }
    }
    
    process.exit(1);
  }
}

// Enhanced process event handlers
process.on('SIGINT', async () => {
  console.log('\n🔄 Gracefully shutting down...');
  try {
    await sequelize.close();
    console.log('✅ Database connection closed.');
    server.close(() => {
      console.log('✅ Server closed.');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  await sequelize.close();
  server.close(() => {
    process.exit(0);
  });
});

// Enhanced uncaught exception handler
process.on('uncaughtException', async (error) => {
  console.error('💥 Uncaught Exception:', error);
  
  // Attempt graceful recovery for database issues
  if (error.message.includes('UNIQUE constraint') || 
      error.message.includes('database') || 
      error.message.includes('SQLITE')) {
    console.log('🔄 Attempting database recovery...');
    try {
      await syncDatabase({ force: true });
      console.log('✅ Database recovered. Continuing...');
      return;
    } catch (recoveryError) {
      console.error('❌ Recovery failed:', recoveryError);
    }
  }
  
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  
  // Don't exit in development for better debugging
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Start the server
startServer();