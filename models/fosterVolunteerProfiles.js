'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class FosterVolunteerProfiles extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            FosterVolunteerProfiles.belongsTo(models.Users, {
                foreignKey: 'userId'
            });
        }
    }

    FosterVolunteerProfiles.init({
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
        userId: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        petTypesToFoster: {
            primaryKey: false,
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },
        petSizesToFoster: {
            primaryKey: false,
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },
        province: DataTypes.STRING,
        location: DataTypes.STRING,
        additionalInformation: DataTypes.STRING,
        available: DataTypes.BOOLEAN,
        averageRating: DataTypes.FLOAT,
        ratingAmount: DataTypes.INTEGER,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'FosterVolunteerProfiles',
    });
    return FosterVolunteerProfiles;
}
