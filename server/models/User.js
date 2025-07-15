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
      type: DataTypes.ENUM('online', 'offline', 'away', 'busy', 'invisible'),
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
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    twoFactorSecret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'en',
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC',
    },
    theme: {
      type: DataTypes.ENUM('light', 'dark', 'auto'),
      defaultValue: 'auto',
    },
    notificationSettings: {
      type: DataTypes.JSON,
      defaultValue: {
        messages: true,
        calls: true,
        groups: true,
        stories: true,
        sound: true,
        vibration: true,
        preview: true
      }
    },
    privacySettings: {
      type: DataTypes.JSON,
      defaultValue: {
        lastSeen: 'everyone',
        profilePhoto: 'everyone',
        about: 'everyone',
        status: 'contacts',
        readReceipts: true,
        groups: 'everyone'
      }
    },
    blockedUsers: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    deviceTokens: {
      type: DataTypes.JSON,
      defaultValue: []
    }
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
      },
      {
        fields: ['status']
      },
      {
        fields: ['lastSeen']
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
    User.hasMany(models.Contact, {
      foreignKey: 'userId',
      as: 'contacts'
    });
    User.hasMany(models.Contact, {
      foreignKey: 'contactId',
      as: 'contactOf'
    });
    User.hasMany(models.UserSession, {
      foreignKey: 'userId',
      as: 'sessions'
    });
  };

  return User;
};