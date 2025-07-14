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

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? false : false, // Disable logging for cleaner output
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true, // Prevent table name pluralization
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    // Enable foreign key constraints
    foreignKeys: true,
  },
  // Disable automatic table creation to prevent conflicts
  sync: {
    force: false,
    alter: false
  }
});

// Initialize models with proper error handling
const models = {};

try {
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

// Define associations with error handling
try {
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

export { sequelize };
export default models;