import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MessageReaction = sequelize.define('MessageReaction', {
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
    emoji: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'MessageReactions',
    indexes: [
      {
        unique: true,
        fields: ['messageId', 'userId', 'emoji']
      }
    ]
  });

  MessageReaction.associate = (models) => {
    MessageReaction.belongsTo(models.Message, { 
      foreignKey: 'messageId' 
    });
    MessageReaction.belongsTo(models.User, { 
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return MessageReaction;
};