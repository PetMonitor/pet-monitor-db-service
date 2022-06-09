'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PredictionFeedbackLog', {
      uuid: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        noUpdate: true
      },
      searchedNoticeId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      predictedNoticeIds: Sequelize.STRING,
      predictionResult: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    }).then(() => {
      queryInterface.addConstraint('PredictionFeedbackLog', {
        type: 'foreign key',
        fields: ['searchedNoticeId'],
        name: 'fk_prediction_feedback_log_notices_noticeId',
        references: {
          table: 'Notices',
          field: 'uuid'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PredictionFeedbackLog');
  }
};
