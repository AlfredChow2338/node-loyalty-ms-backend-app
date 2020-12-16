const dbConnection = require("./util/dbConnection")
const moment = require('moment')

const config = require('./data/config.json')
const empty = config.empty

const point_reward_id = 1
let countQ = 0

const pool = dbConnection.getConnectionPool()

async function addRegisterationPoints () {
    const now = moment().utc().toISOString()
    let client = await pool.connect()
    const res_pt = await client.query(`SELECT point FROM mobijuce_loyalty_point_reward WHERE id = ${point_reward_id}`)
    const points_to_add = res_pt.rows[0].point
    // console.log(points_to_add);
    client.release()

    client = await pool.connect()
    // Select newly registrated users
    const sqlStr = "SELECT lp.client_id, lp.points FROM mobijuce_loyalty_points lp WHERE lp.client_id NOT IN (SELECT client_id FROM mobijuce_loyalty_log WHERE point_reward_id = 2) and lp.points = 0 order by client_id"
    const res = await client.query(sqlStr)

    // Get the result from query
    if (res) {
        const len = res.rowCount
        let i = 0

        // Loop to insert and update tables
        for (; i < len; i++) {
            let client_id = res.rows[i].client_id
            let point_o = res.rows[i].points

            if (client_id) {
                // Insert into MOBIJUCE_LOYALTY_LOG
                let insertQuery = `INSERT INTO mobijuce_loyalty_log (client_id, created, updated, point_o, point_n, point_reward_id, product_redemption_id, buy_offer_id, daily_login_count, rent_record_id, transaction_id, is_redeemed) VALUES (${client_id}, '${now}', '${now}', ${point_o}, ${point_o} + ${points_to_add}, ${point_reward_id}, ${empty}, ${empty}, ${empty}, ${empty}, ${empty}, false)`
                await client.query(insertQuery)

                // Update MOBIJUCE_LOYALTY_POINTS
                let updateQuery = `UPDATE mobijuce_loyalty_points SET points = points + ${points_to_add} where client_id = ${client_id}`
                await client.query(updateQuery)

                countQ ++

                console.log('----------------------------------------')
                console.log(`Added ${points_to_add} to client ${client_id} at ${now}`)
                console.log(countQ, 'queries have been executed.')
            }
        }
    }
    client.release()
    console.log('----------------------------------------')
    console.log(`Connection ends at ${now}.`)
    console.log(`Total ${countQ} queries have been executed for registration.`)
    console.log('----------------------------------------')
}

module.exports = {
    addRegisterationPoints
}
