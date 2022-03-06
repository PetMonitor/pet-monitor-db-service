'use strict';

const { Model } = require('sequelize');
const db = require('.');

module.exports = (sequelize, DataTypes) => {
  class pets extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      console.log('Running Pets associate to Users.')
      pets.belongsTo(models.users, {
        name: 'user_id',
        foreignKey:'uuid'
      });

      pets.hasMany(models.pet_photos, {
        foreignKey: 'pet_id'
      });
    }
  };

  pets.init({
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
    user_id: { 
      primaryKey: true,
      allowNull: false,
      type: DataTypes.UUID 
    },
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    fur_color: DataTypes.STRING,
    right_eye_color: DataTypes.STRING,
    left_eye_color: DataTypes.STRING,
    breed: DataTypes.STRING,
    size: DataTypes.STRING,
    life_stage: DataTypes.STRING,
    age: DataTypes.INTEGER,
    sex: DataTypes.STRING,
    description: DataTypes.TEXT,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'pets',
  });
  return pets;
};