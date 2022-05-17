#!/usr/bin/env bash

psql ${POSTGRESQL_DATABASE} postgres <<-'SQL'
GRANT ALL PRIVILEGES ON DATABASE my_database TO my_user;
CREATE EXTENSION IF NOT EXISTS postgis;
SQL