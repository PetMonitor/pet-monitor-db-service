'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('FosterVolunteerProfiles', {
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
      userId: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      petTypesToFoster: {
        primaryKey: false,
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      petSizesToFoster: {
        primaryKey: false,
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      province: Sequelize.STRING,
      location: Sequelize.STRING,
      additionalInformation: Sequelize.STRING,
      available: Sequelize.BOOLEAN,
      averageRating: Sequelize.FLOAT,
      ratingAmount: Sequelize.INTEGER,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    }).then(() => {
      queryInterface.addConstraint('FosterVolunteerProfiles', {
        type: 'foreign key',
        fields: ['userId'],
        name: 'fk_foster_volunteer_profiles_users_userId',
        references: {
          table: 'Users',
          field: 'uuid'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('FosterVolunteerProfiles');
  }
};
