'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class photos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  };
  
  photos.init({
    uuid: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      noUpdate: true
    },
    photo: DataTypes.BLOB,
    low_res_photo: DataTypes.BLOB,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    sequelize,
    modelName: 'photos',
  });
  return photos;
};