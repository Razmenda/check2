import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const UserSession = sequelize.define('UserSession', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    sessionToken: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    deviceInfo: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastActivity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {
    tableName: 'UserSessions',
    indexes: [
      {
        unique: true,
        fields: ['sessionToken']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['expiresAt']
      }
    ]
  });

  UserSession.associate = (models) => {
    UserSession.belongsTo(models.User, { 
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return UserSession;
};