import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const StoryView = sequelize.define('StoryView', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    storyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Stories',
        key: 'id',
      },
    },
    viewerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    viewedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'StoryViews',
    indexes: [
      {
        unique: true,
        fields: ['storyId', 'viewerId']
      }
    ]
  });

  StoryView.associate = (models) => {
    StoryView.belongsTo(models.Story, { 
      foreignKey: 'storyId' 
    });
    StoryView.belongsTo(models.User, { 
      foreignKey: 'viewerId',
      as: 'viewer'
    });
  };

  return StoryView;
};