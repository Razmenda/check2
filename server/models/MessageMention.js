import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MessageMention = sequelize.define('MessageMention', {
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
    mentionedUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    mentionedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    startIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    endIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    tableName: 'MessageMentions',
    indexes: [
      {
        fields: ['messageId']
      },
      {
        fields: ['mentionedUserId']
      }
    ]
  });

  MessageMention.associate = (models) => {
    MessageMention.belongsTo(models.Message, { 
      foreignKey: 'messageId' 
    });
    MessageMention.belongsTo(models.User, { 
      foreignKey: 'mentionedUserId',
      as: 'mentionedUser'
    });
    MessageMention.belongsTo(models.User, { 
      foreignKey: 'mentionedBy',
      as: 'mentioner'
    });
  };

  return MessageMention;
};