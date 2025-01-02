require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,         // PostgreSQL user
    host: process.env.DB_HOST,         // PostgreSQL host
    database: process.env.DB_DATABASE, // PostgreSQL database name
    password: process.env.DB_PASSWORD, // PostgreSQL password
    port: process.env.DB_PORT,         // PostgreSQL port
    // ssl: {
    //     rejectUnauthorized: false
    // }
});

module.exports = pool;