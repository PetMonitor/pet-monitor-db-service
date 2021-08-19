# entrypoint.sh

npx sequelize-cli db:migrate
# npx sequelize-cli db:seed:all

node app.js