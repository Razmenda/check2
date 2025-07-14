import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 50],
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    status: {
      type: DataTypes.ENUM('online', 'offline', 'away'),
      defaultValue: 'offline',
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'Hey there! I am using Chekawak Messenger.',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    lastSeen: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'Users',
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['username']
      }
    ]
  });

  User.associate = (models) => {
    User.hasMany(models.Message, { 
      foreignKey: 'senderId',
      as: 'sentMessages'
    });
    User.belongsToMany(models.Chat, { 
      through: models.ChatParticipant,
      foreignKey: 'userId',
      as: 'chats'
    });
    User.hasMany(models.ChatParticipant, { 
      foreignKey: 'userId' 
    });
    User.hasMany(models.Call, { 
      foreignKey: 'initiatorId',
      as: 'initiatedCalls'
    });
    User.hasMany(models.Story, {
      foreignKey: 'userId',
      as: 'stories'
    });
    User.hasMany(models.StoryView, {
      foreignKey: 'viewerId',
      as: 'storyViews'
    });
    User.hasMany(models.MessageReaction, {
      foreignKey: 'userId',
      as: 'messageReactions'
    });
    User.hasMany(models.MessageStatus, {
      foreignKey: 'userId',
      as: 'messageStatuses'
    });
  };

  return User;
};