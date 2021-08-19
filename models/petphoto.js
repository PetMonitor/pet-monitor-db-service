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
      // define association here
    }
  };
  PetPhotos.init({
    petId: DataTypes.UUID,
    photoId: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'PetPhotos',
  });
  return PetPhotos;
};