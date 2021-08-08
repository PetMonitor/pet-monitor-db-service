# Pet Monitor Database Service

## Requirements

	* Docker

## Build and Run the project locally

1. To run this project locally you only need to have docker compose. Go to the project root directory and run:

`docker compose up`

2. A postgresql database will be set up at 0.0.0.0:5432

## Deploy to Heroku

1. You must create a heroku application and apply the heroku-postgresql addon. For the application to run, you will need to set the database URL through as a config var DATABASE_URL.