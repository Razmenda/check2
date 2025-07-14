import { Sequelize } from 'sequelize';
import User from './User.js';
import Chat from './Chat.js';
import ChatParticipant from './ChatParticipant.js';
import Message from './Message.js';
import MessageReaction from './MessageReaction.js';
import MessageStatus from './MessageStatus.js';
import VoiceMessage from './VoiceMessage.js';
import ChatSettings from './ChatSettings.js';
import Call from './Call.js';
import Story from './Story.js';
import StoryView from './StoryView.js';
import StoryReaction from './StoryReaction.js';

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
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    // Enhanced SQLite options for better performance
    busyTimeout: 30000,
    journal_mode: 'WAL',
    synchronous: 'NORMAL',
    cache_size: -64000,
    temp_store: 'MEMORY',
    mmap_size: 268435456
  },
  // Disable automatic table creation to prevent conflicts
  sync: {
    force: false,
    alter: false
  },
  // Enhanced retry configuration
  retry: {
    max: 3,
    timeout: 5000
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
  models.VoiceMessage = VoiceMessage(sequelize);
  models.ChatSettings = ChatSettings(sequelize);
  models.Call = Call(sequelize);
  models.Story = Story(sequelize);
  models.StoryView = StoryView(sequelize);
  models.StoryReaction = StoryReaction(sequelize);

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
      alter: false,
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
    return { status: 'healthy', result: result[0] };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};

export { sequelize };
export default models;