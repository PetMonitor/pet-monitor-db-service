# Pet Monitor Database Service [![Build Status](https://app.travis-ci.com/PetMonitor/pet-monitor-db-service.svg?branch=master)](https://app.travis-ci.com/PetMonitor/pet-monitor-db-service)

## Requirements

- Docker

## Build and Run the project locally

To run this project locally you only need to have docker compose. Go to the project root directory and run:

`docker compose up`

2. A postgresql database will be set up at 0.0.0.0:5432

## Run tests locally

Set up a local database for testing:

`docker build -t petmonitor/postgres -f Dockerfile-db .`

`docker run -e POSTGRESQL_USERNAME=my_user -e POSTGRESQL_DATABASE=my_database -e POSTGRESQL_PASSWORD=pass -p 5432:5432 petmonitor/postgres`

And set credentials accordingly at config/config.js file, in the test configuration section.

Run tests using:
`export NODE_ENV=test`
`npm test`

## Deploy to Heroku

1. You must create a heroku application and apply the heroku-postgresql addon. For the application to run, you will need to set the database URL through as a config var DATABASE_URL.

## Restore Database from backup

For this step to work, the commands in 'entrypoint.sh' file that run migration and seeding MUST BE commented out.

To restore database from backup:

    1) Copy backup file to project root (backup.sql.zip) into copy to container:
        `docker cp backup.sql db:/tmp`
    2) Exec into container command line:
        `docker exec -it db /bin/bash`
    3) Restore database table and contents by running this command:
        `psql -U my_user -d my_database -f /tmp/backup.sql`

## Run Migrations and use Seeds

If you choose to run migrations and use seeder values, uncomment lines to run
migration and seeding respectively in 'entrypoint.sh' file.