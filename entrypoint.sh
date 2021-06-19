# entrypoint.sh

npm install
npm install dotenv

npx sequelize-cli db:migrate

node app.js