'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Photos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  
  Photos.init({
    uuid: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      noUpdate: true
    },
    photo: DataTypes.BLOB
  },
  {
    sequelize,
    modelName: 'Photos',
  });
  return Photos;
};