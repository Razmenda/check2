import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Contact = sequelize.define('Contact', {
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
    contactId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    addedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    lastInteraction: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'Contacts',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'contactId']
      },
      {
        fields: ['isBlocked']
      },
      {
        fields: ['isFavorite']
      }
    ]
  });

  Contact.associate = (models) => {
    Contact.belongsTo(models.User, { 
      foreignKey: 'userId',
      as: 'user'
    });
    Contact.belongsTo(models.User, { 
      foreignKey: 'contactId',
      as: 'contact'
    });
  };

  return Contact;
};