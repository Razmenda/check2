import { Sequelize } from 'sequelize';
import User from './User.js';
import Chat from './Chat.js';
import ChatParticipant from './ChatParticipant.js';
import Message from './Message.js';
import MessageReaction from './MessageReaction.js';
import MessageStatus from './MessageStatus.js';
import MessageForward from './MessageForward.js';
import MessageMention from './MessageMention.js';
import VoiceMessage from './VoiceMessage.js';
import ChatSettings from './ChatSettings.js';
import ChatMute from './ChatMute.js';
import Call from './Call.js';
import Story from './Story.js';
import StoryView from './StoryView.js';
import StoryReaction from './StoryReaction.js';
import Contact from './Contact.js';
import UserSession from './UserSession.js';
import Notification from './Notification.js';

// Enhanced SQLite configuration for better performance and reliability
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci'
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  dialectOptions: {
    // Enhanced SQLite options for better performance
    busyTimeout: 30000,
    journal_mode: 'WAL',
    synchronous: 'NORMAL',
    cache_size: -64000,
    temp_store: 'MEMORY',
    mmap_size: 268435456,
    foreign_keys: 1
  },
  // Disable automatic table creation to prevent conflicts
  sync: {
    force: false,
    alter: false
  },
  // Enhanced retry configuration
  retry: {
    max: 5,
    timeout: 10000
  }
});

// Initialize models with comprehensive error handling
const models = {};

try {
  console.log('🔄 Initializing database models...');
  
  models.User = User(sequelize);
  models.Chat = Chat(sequelize);
  models.ChatParticipant = ChatParticipant(sequelize);
  models.Message = Message(sequelize);
  models.MessageReaction = MessageReaction(sequelize);
  models.MessageStatus = MessageStatus(sequelize);
  models.MessageForward = MessageForward(sequelize);
  models.MessageMention = MessageMention(sequelize);
  models.VoiceMessage = VoiceMessage(sequelize);
  models.ChatSettings = ChatSettings(sequelize);
  models.ChatMute = ChatMute(sequelize);
  models.Call = Call(sequelize);
  models.Story = Story(sequelize);
  models.StoryView = StoryView(sequelize);
  models.StoryReaction = StoryReaction(sequelize);
  models.Contact = Contact(sequelize);
  models.UserSession = UserSession(sequelize);
  models.Notification = Notification(sequelize);

  console.log('✅ All models initialized successfully');
} catch (error) {
  console.error('❌ Error initializing models:', error);
  throw error;
}

// Define associations with comprehensive error handling
try {
  console.log('🔄 Setting up model associations...');
  
  Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });
  
  console.log('✅ All model associations defined successfully');
} catch (error) {
  console.error('❌ Error defining associations:', error);
  throw error;
}

// Enhanced database connection test
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

// Enhanced database synchronization with proper error handling
export const syncDatabase = async (options = {}) => {
  try {
    console.log('🔄 Synchronizing database schema...');
    
    const defaultOptions = {
      force: false,
      alter: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development'
    };
    
    const syncOptions = { ...defaultOptions, ...options };
    
    await sequelize.sync(syncOptions);
    console.log('✅ Database synchronized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    
    // If sync fails, try to recover
    if (error.message.includes('UNIQUE constraint') || error.message.includes('backup')) {
      console.log('🔄 Attempting database recovery...');
      try {
        await sequelize.sync({ force: true, logging: false });
        console.log('✅ Database recovered successfully');
        return true;
      } catch (recoveryError) {
        console.error('❌ Database recovery failed:', recoveryError);
        throw recoveryError;
      }
    }
    
    throw error;
  }
};

// Database health check
export const healthCheck = async () => {
  try {
    await sequelize.authenticate();
    const result = await sequelize.query('SELECT 1 as health');
    
    // Check table counts
    const tableStats = {};
    for (const modelName of Object.keys(models)) {
      try {
        const count = await models[modelName].count();
        tableStats[modelName] = count;
      } catch (error) {
        tableStats[modelName] = 'error';
      }
    }
    
    return { 
      status: 'healthy', 
      result: result[0],
      tableStats,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Database cleanup utilities
export const cleanupExpiredSessions = async () => {
  try {
    const expired = await models.UserSession.destroy({
      where: {
        expiresAt: {
          [sequelize.Op.lt]: new Date()
        }
      }
    });
    console.log(`🧹 Cleaned up ${expired} expired sessions`);
    return expired;
  } catch (error) {
    console.error('❌ Error cleaning up sessions:', error);
    return 0;
  }
};

export const cleanupExpiredNotifications = async () => {
  try {
    const expired = await models.Notification.destroy({
      where: {
        expiresAt: {
          [sequelize.Op.lt]: new Date()
        }
      }
    });
    console.log(`🧹 Cleaned up ${expired} expired notifications`);
    return expired;
  } catch (error) {
    console.error('❌ Error cleaning up notifications:', error);
    return 0;
  }
};

// Add sequelize instance to models for direct access
models.sequelize = sequelize;
models.Sequelize = Sequelize;

export { sequelize };
export default models;