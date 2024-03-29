'use strict';

const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Users.hasMany(models.Pets, {
        name: 'userId',
        foreignKey:'uuid'
      });

      Users.hasMany(models.PetsFosterHistory, {
        name: 'userId',
        foreignKey:'uuid'
      });

      Users.hasOne(models.Photos, {
        name: 'profilePicture',
        foreignKey: 'uuid'      
      });
    }
  };
  
  Users.init({
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
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: DataTypes.STRING,
    name: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    facebookId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profilePicture: Sequelize.UUIDV4,
    alertsActivated: Sequelize.BOOLEAN,
    alertsForReportTypes: DataTypes.STRING,
    alertCoordinates: DataTypes.GEOGRAPHY,
    alertRegion: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};