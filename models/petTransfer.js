'use strict';

const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PetTransfers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PetTransfers.hasOne(models.Pets, {
        name: 'petId',
        foreignKey:'uuid'
      });

      PetTransfers.hasOne(models.Users, {
        name: 'transferFromUser',
        foreignKey:'uuid'
      });

      PetTransfers.hasOne(models.Users, {
        as: 'transferTo',
        name: 'transferToUser',
        foreignKey:'uuid'
      });
    }
  };
  
  PetTransfers.init({
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
    petId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    transferFromUser: {
      type: DataTypes.UUID,  
      allowNull: false
    },
    transferToUser: {
      type: DataTypes.UUID,
      allowNull: false  
    },
    activeFrom: {
      type: DataTypes.DATE,
      allowNull: false    
    },
    activeUntil: {
      type: DataTypes.DATE,
      allowNull: false    
    },
    cancelled: {
      type: DataTypes.BOOLEAN,  
      allowNull: false
    },
    completedOn: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'PetTransfers',
  });
  return PetTransfers;
};