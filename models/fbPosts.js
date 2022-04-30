'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FacebookPosts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  FacebookPosts.init({
    uuid: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      noUpdate: true
    },
    _ref: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    postId: {
      primaryKey: false,
      type: DataTypes.STRING,
      allowNull: false,
      noUpdate: true,
      unique: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    message: {
      primaryKey: false,
      type: DataTypes.STRING,
      allowNull: true
    },
    noticeType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    eventTimestamp: {
      type: DataTypes.STRING
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
    modelName: 'FacebookPosts',
  });
  return FacebookPosts;
};