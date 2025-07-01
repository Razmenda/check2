import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const StoryReaction = sequelize.define('StoryReaction', {
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('like', 'love', 'laugh', 'wow', 'sad', 'angry'),
      defaultValue: 'like',
    },
    emoji: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'StoryReactions',
    indexes: [
      {
        unique: true,
        fields: ['storyId', 'userId']
      }
    ]
  });

  StoryReaction.associate = (models) => {
    StoryReaction.belongsTo(models.Story, { 
      foreignKey: 'storyId' 
    });
    StoryReaction.belongsTo(models.User, { 
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return StoryReaction;
};