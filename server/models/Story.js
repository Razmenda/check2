import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Story = sequelize.define('Story', {
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
    type: {
      type: DataTypes.ENUM('image', 'video', 'text'),
      defaultValue: 'image',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    backgroundColor: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '#1F3934',
    },
    textColor: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '#FFFFFF',
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 24, // hours
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'Stories',
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['expiresAt']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  Story.associate = (models) => {
    Story.belongsTo(models.User, { 
      foreignKey: 'userId',
      as: 'user'
    });
    Story.hasMany(models.StoryView, { 
      foreignKey: 'storyId',
      as: 'views'
    });
    Story.hasMany(models.StoryReaction, { 
      foreignKey: 'storyId',
      as: 'reactions'
    });
  };

  return Story;
};