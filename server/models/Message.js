import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Chats',
        key: 'id',
      },
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('text', 'image', 'file', 'audio', 'voice', 'video', 'location', 'contact'),
      defaultValue: 'text',
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    replyToId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Messages',
        key: 'id',
      },
    },
    isForwarded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    forwardedFromId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Messages',
        key: 'id',
      },
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true, // for disappearing messages
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true, // for storing additional data like location coordinates, contact info, etc.
    },
  }, {
    tableName: 'Messages'
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Chat, { 
      foreignKey: 'chatId' 
    });
    Message.belongsTo(models.User, { 
      foreignKey: 'senderId', 
      as: 'sender' 
    });
    Message.belongsTo(models.Message, {
      foreignKey: 'replyToId',
      as: 'replyTo'
    });
    Message.belongsTo(models.Message, {
      foreignKey: 'forwardedFromId',
      as: 'forwardedFrom'
    });
    Message.hasMany(models.MessageReaction, {
      foreignKey: 'messageId',
      as: 'reactions'
    });
    Message.hasMany(models.MessageStatus, {
      foreignKey: 'messageId',
      as: 'statuses'
    });
    Message.hasOne(models.VoiceMessage, {
      foreignKey: 'messageId',
      as: 'voiceMessage'
    });
  };

  return Message;
};