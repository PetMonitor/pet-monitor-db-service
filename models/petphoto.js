'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class pet_photos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      pet_photos.belongsTo(models.photos, {
        foreignKey: 'photo_id'      
      });
    }
  };
  pet_photos.init({
    pet_id: {
      primaryKey: true,
      type: DataTypes.UUID
    },
    photo_id: {
      primaryKey: true,
      type: DataTypes.UUID
    },
    embedding: {
      primaryKey: false,
      type: DataTypes.ARRAY(DataTypes.FLOAT)
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'pet_photos',
  });
  return pet_photos;
};