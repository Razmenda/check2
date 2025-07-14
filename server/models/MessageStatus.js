import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MessageStatus = sequelize.define('MessageStatus', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Messages',
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
    status: {
      type: DataTypes.ENUM('sent', 'delivered', 'read'),
      defaultValue: 'sent',
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'MessageStatuses',
    indexes: [
      {
        unique: true,
        fields: ['messageId', 'userId']
      }
    ]
  });

  MessageStatus.associate = (models) => {
    MessageStatus.belongsTo(models.Message, { 
      foreignKey: 'messageId' 
    });
    MessageStatus.belongsTo(models.User, { 
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return MessageStatus;
};