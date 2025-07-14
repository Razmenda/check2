import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const VoiceMessage = sequelize.define('VoiceMessage', {
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
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false, // in seconds
    },
    waveform: {
      type: DataTypes.JSON,
      allowNull: true, // array of amplitude values
    },
    transcription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'VoiceMessages'
  });

  VoiceMessage.associate = (models) => {
    VoiceMessage.belongsTo(models.Message, { 
      foreignKey: 'messageId',
      as: 'message'
    });
  };

  return VoiceMessage;
};