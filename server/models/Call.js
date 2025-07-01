import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Call = sequelize.define('Call', {
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
    initiatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    participants: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'ongoing', 'ended', 'missed'),
      defaultValue: 'pending',
    },
    type: {
      type: DataTypes.ENUM('audio', 'video'),
      defaultValue: 'audio',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'Calls'
  });

  Call.associate = (models) => {
    Call.belongsTo(models.Chat, { 
      foreignKey: 'chatId' 
    });
    Call.belongsTo(models.User, { 
      foreignKey: 'initiatorId', 
      as: 'initiator' 
    });
  };

  return Call;
};