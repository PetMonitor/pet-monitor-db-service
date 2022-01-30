# Pet Monitor Database Service [![Build Status](https://app.travis-ci.com/PetMonitor/pet-monitor-db-service.svg?branch=master)](https://app.travis-ci.com/PetMonitor/pet-monitor-db-service)

## Requirements

- Docker

## Build and Run the project locally

To run this project locally you only need to have docker compose. Go to the project root directory and run:

`docker compose up`

2. A postgresql database will be set up at 0.0.0.0:5432

## Run tests locally

Set up a local database for testing:

`docker run -e POSTGRESQL_USERNAME=postgres -e POSTGRESQL_DATABASE=pet-monitor-db -e POSTGRESQL_PASSWORD=pass -p 5432:5432 bitnami/postgresql`

And set credentials accordinly at config/config.js file, in the test configuration section.

Run tests using:
`export NODE_ENV=test`
`npm test`

## Deploy to Heroku

1. You must create a heroku application and apply the heroku-postgresql addon. For the application to run, you will need to set the database URL through as a config var DATABASE_URL.