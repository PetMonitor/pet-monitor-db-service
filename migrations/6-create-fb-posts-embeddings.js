'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('FacebookPostsEmbeddings', {
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
      photoId: {
        primaryKey: true,
        type: Sequelize.STRING,
        allowNull: false,
        noUpdate: true,
        unique: true
      },
      postId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
        noUpdate: true
      },
      embedding: {
        primaryKey: false,
        type: Sequelize.ARRAY(Sequelize.FLOAT),
        defaultValue: []
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => {
        queryInterface.addConstraint('FacebookPostsEmbeddings', {
          type: 'foreign key',
          fields: ['postId'],
          name: 'fk_facebookPostsEmbeddings_facebookPosts_postId',
          references: {
            table: 'FacebookPosts',
            field: 'uuid'
          },
          onDelete: 'cascade',
          onUpdate: 'no action',
        })
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('FacebookPostsEmbeddings');
  }
};