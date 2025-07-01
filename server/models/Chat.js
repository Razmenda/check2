import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Chat = sequelize.define('Chat', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isGroup: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  }, {
    tableName: 'Chats'
  });

  Chat.associate = (models) => {
    Chat.hasMany(models.Message, { 
      foreignKey: 'chatId',
      as: 'messages'
    });
    Chat.belongsToMany(models.User, { 
      through: models.ChatParticipant,
      foreignKey: 'chatId',
      as: 'participants'
    });
    Chat.hasMany(models.ChatParticipant, { 
      foreignKey: 'chatId',
      as: 'participantRelations'
    });
    Chat.hasMany(models.Call, { 
      foreignKey: 'chatId',
      as: 'calls'
    });
    Chat.belongsTo(models.User, { 
      foreignKey: 'createdBy',
      as: 'creator'
    });
  };

  return Chat;
};