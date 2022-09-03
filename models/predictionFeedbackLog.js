'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class PredictionFeedbackLog extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            PredictionFeedbackLog.belongsTo(models.Notices, {
                foreignKey: 'searchedNoticeId'
            });
        }
    }

    PredictionFeedbackLog.init({
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            noUpdate: true
        },
        searchedNoticeId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        predictedNoticeIds: DataTypes.TEXT,
        predictionResult: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'PredictionFeedbackLog',
        freezeTableName: true,
    });
    return PredictionFeedbackLog;
}
