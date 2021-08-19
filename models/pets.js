'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pets extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };

  Pets.init({
    uuid: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      noUpdate: true
    },
    userId: { 
      primaryKey: true,
      allowNull: false,
      type: DataTypes.UUID 
    },
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    furColor: DataTypes.STRING,
    rightEyeColor: DataTypes.STRING,
    leftEyeColor: DataTypes.STRING,
    breed: DataTypes.STRING,
    size: DataTypes.STRING,
    lifeStage: DataTypes.STRING,
    age: DataTypes.INTEGER,
    sex: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Pets',
  });
  return Pets;
};