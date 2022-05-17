'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FacebookPostsEmbeddings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      FacebookPostsEmbeddings.belongsTo(models.FacebookPosts, {
        foreignKey: 'postId'
      });
    }
  };
  FacebookPostsEmbeddings.init({
    uuid: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      noUpdate: true
    },
    _ref: {
      primaryKey: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    postId: {
      type: DataTypes.UUIDV4,
    },
    photoId: {
      primaryKey: true,
      type: DataTypes.STRING,
      allowNull: false,
      noUpdate: true
    },
    url: {
      type: DataTypes.STRING,
    },
    embedding: {
      primaryKey: false,
      type: DataTypes.ARRAY(DataTypes.FLOAT),
      defaultValue: []
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'FacebookPostsEmbeddings',
  });
  return FacebookPostsEmbeddings;
};