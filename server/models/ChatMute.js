import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ChatMute = sequelize.define('ChatMute', {
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
    mutedUntil: {
      type: DataTypes.DATE,
      allowNull: true, // null means muted forever
    },
    muteType: {
      type: DataTypes.ENUM('all', 'mentions_only'),
      defaultValue: 'all',
    }
  }, {
    tableName: 'ChatMutes',
    indexes: [
      {
        unique: true,
        fields: ['chatId', 'userId']
      },
      {
        fields: ['mutedUntil']
      }
    ]
  });

  ChatMute.associate = (models) => {
    ChatMute.belongsTo(models.Chat, { 
      foreignKey: 'chatId' 
    });
    ChatMute.belongsTo(models.User, { 
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return ChatMute;
};