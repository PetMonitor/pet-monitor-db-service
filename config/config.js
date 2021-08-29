require('dotenv').config(); 
module.exports = {
    production: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    },
    development: {
        username: 'my_user',
        password: 'password123',
        database: 'my_database',
        host: 'db',
        port: 5432,
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {}
    },
    test: {
        username: 'postgres',
        password: 'pass',// null,
        database: 'pet-monitor-db',
        host: '0.0.0.0',
        port: 5432,
        dialect: 'postgres',
        protocol: 'postgres'
    }
};