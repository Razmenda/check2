import { Sequelize } from 'sequelize';
import User from './User.js';
import Chat from './Chat.js';
import ChatParticipant from './ChatParticipant.js';
import Message from './Message.js';
import Call from './Call.js';
import Story from './Story.js';
import StoryView from './StoryView.js';
import StoryReaction from './StoryReaction.js';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Initialize models
const models = {
  User: User(sequelize),
  Chat: Chat(sequelize),
  ChatParticipant: ChatParticipant(sequelize),
  Message: Message(sequelize),
  Call: Call(sequelize),
  Story: Story(sequelize),
  StoryView: StoryView(sequelize),
  StoryReaction: StoryReaction(sequelize),
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export { sequelize };
export default models;