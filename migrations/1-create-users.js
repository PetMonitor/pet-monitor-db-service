'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      uuid: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        noUpdate: true
      },
      _ref: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        unique: true
      },
      name: {
        type: Sequelize.STRING
      },
      facebookId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      phoneNumber: {
        type: Sequelize.STRING
      },
      profilePicture: {
        type: Sequelize.UUID
      },
      alertsActivated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      alertsForReportTypes: {
        type:  Sequelize.STRING
      },
      alertCoordinates: {
        type: Sequelize.GEOGRAPHY,
      },
      alertRegion: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    }).then(() => {
      queryInterface.addConstraint('Users', {
        type: 'foreign key',
        fields: ['profilePicture'],
        name: 'fk_photos_users_profilePicture',
        references: {
          table: 'Photos',
          field: 'uuid'
        },
        onDelete: 'cascade',
        onUpdate: 'no action',
      })
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};