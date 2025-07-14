import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ChatSettings = sequelize.define('ChatSettings', {
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    isMuted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    customNotificationSound: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wallpaper: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    disappearingMessagesTimer: {
      type: DataTypes.INTEGER,
      allowNull: true, // in seconds, null means disabled
    },
  }, {
    tableName: 'ChatSettings',
    indexes: [
      {
        unique: true,
        fields: ['chatId', 'userId']
      }
    ]
  });

  ChatSettings.associate = (models) => {
    ChatSettings.belongsTo(models.Chat, { 
      foreignKey: 'chatId' 
    });
    ChatSettings.belongsTo(models.User, { 
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return ChatSettings;
};