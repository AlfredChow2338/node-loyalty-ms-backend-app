const {Client} = require('pg')
const pg = require('pg')
require('dotenv').config()

const cn = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
};

const Pool = pg.Pool
const client = new Client(cn)

function getClient () {
    return client
}

const pool = new Pool(cn)

function getConnectionPool() {
    return pool;
}


module.exports = {
    getClient,
    getConnectionPool
};
