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
      type: DataTypes.ENUM('text', 'image', 'file', 'audio'),
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
  };

  return Message;
};