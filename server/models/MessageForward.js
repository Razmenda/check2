import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MessageForward = sequelize.define('MessageForward', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    originalMessageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Messages',
        key: 'id',
      },
    },
    forwardedMessageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Messages',
        key: 'id',
      },
    },
    forwardedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    forwardedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'MessageForwards',
    indexes: [
      {
        fields: ['originalMessageId']
      },
      {
        fields: ['forwardedMessageId']
      },
      {
        fields: ['forwardedBy']
      }
    ]
  });

  MessageForward.associate = (models) => {
    MessageForward.belongsTo(models.Message, { 
      foreignKey: 'originalMessageId',
      as: 'originalMessage'
    });
    MessageForward.belongsTo(models.Message, { 
      foreignKey: 'forwardedMessageId',
      as: 'forwardedMessage'
    });
    MessageForward.belongsTo(models.User, { 
      foreignKey: 'forwardedBy',
      as: 'forwarder'
    });
  };

  return MessageForward;
};