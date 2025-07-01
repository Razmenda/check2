import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ChatParticipant = sequelize.define('ChatParticipant', {
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
    role: {
      type: DataTypes.ENUM('admin', 'member'),
      defaultValue: 'member',
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'ChatParticipants',
    indexes: [
      {
        unique: true,
        fields: ['chatId', 'userId']
      }
    ]
  });

  ChatParticipant.associate = (models) => {
    ChatParticipant.belongsTo(models.Chat, { 
      foreignKey: 'chatId' 
    });
    ChatParticipant.belongsTo(models.User, { 
      foreignKey: 'userId' 
    });
  };

  return ChatParticipant;
};