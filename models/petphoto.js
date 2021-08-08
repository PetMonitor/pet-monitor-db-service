'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class petPhoto extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  petPhoto.init({
    petId: DataTypes.UUID,
    photoId: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'petPhoto',
  });
  return petPhoto;
};