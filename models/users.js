'use strict';

const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      users.hasMany(models.pets, {
        name: 'user_id',
        foreignKey:'uuid'
      });

      users.belongsTo(models.photos, {
        name: 'profile_picture',
        foreignKey:'uuid'      
      });
    }
  };
  
  users.init({
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
    phone_number: DataTypes.STRING,
    profile_picture: Sequelize.UUIDV4,
    alerts_activated: Sequelize.BOOLEAN,
    alert_radius: Sequelize.INTEGER,
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};