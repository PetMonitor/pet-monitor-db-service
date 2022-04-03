'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PetPhotos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PetPhotos.belongsTo(models.Photos, {
        foreignKey: 'photoId'
      });
    }
  };
  PetPhotos.init({
    petId: {
      primaryKey: true,
      type: DataTypes.UUID
    },
    photoId: {
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
    modelName: 'PetPhotos',
  });
  return PetPhotos;
};