# entrypoint.sh


npm install
npm install dotenv
npm install --platform=linux --arch=arm64v8 sharp

if [[ "${ENVIRONMENT}" != "production" ]]; then
   apt-get update && apt-get install -y wget
   wget 'https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz' \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-v0.6.1.tar.gz \
    && rm dockerize-linux-amd64-v0.6.1.tar.gz

   echo "Running dockerize..."
   dockerize -wait tcp://db:5432 -timeout 10m
else
   echo "Don't wait. Run migrations."
fi

npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

node app.js