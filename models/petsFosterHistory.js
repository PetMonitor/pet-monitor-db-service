'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class PetsFosterHistory extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            PetsFosterHistory.belongsTo(models.Pets, {
                foreignKey: 'petId'
            });
        }
    }

    PetsFosterHistory.init({
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
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        contactEmail: DataTypes.STRING,
        contactPhone: DataTypes.STRING,
        contactName: DataTypes.STRING,
        sinceDate: DataTypes.DATE,
        untilDate: DataTypes.DATE,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'PetsFosterHistory',
        freezeTableName: true,
    });
    return PetsFosterHistory;
}
