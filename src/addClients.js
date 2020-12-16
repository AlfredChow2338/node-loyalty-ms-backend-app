const dbConnection = require("./util/dbConnection")
const moment = require('moment')

let countQ = 0

const pool = dbConnection.getConnectionPool()

async function addClientsPoints () {
    const now = moment().utc().toISOString()
    const client = await pool.connect()
    // Select clients without data in MOBIJUCE_LOYALTY_POINTS
    const sqlStr = "SELECT id FROM clients WHERE id NOT IN (SELECT client_id FROM mobijuce_loyalty_points)";
    const result = await client.query(sqlStr)
    if (result) {
        let i = 0;
        const len = result.rowCount;
        // Loop to insert clients data into LOYALTY_POINTS
        for (; i < len; i++) {
            let client_id = result.rows[i].id;

            if (client_id) {
                let insertQuery = `INSERT INTO mobijuce_loyalty_points (points, client_id) VALUES (0, ${client_id})`;
                await client.query(insertQuery)

                countQ ++

                console.log('Client', client_id, ' is added to the loyalty programme.')
                console.log(countQ, 'queries have been executed.')
                console.log('----------------------------------------')
            }
        }
    }
    client.release()
    console.log('----------------------------------------')
    console.log(`Connection ends at ${now}.`)
    console.log(`Total ${countQ} queries have been executed for adding clients.`)
    console.log('----------------------------------------')
}

addClientsPoints()

module.exports = {
    addClientsPoints
}
