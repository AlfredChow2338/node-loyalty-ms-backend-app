const dbConnection = require('./util/dbConnection')
const moment = require('moment')

const config = require('./data/config.json')
const empty = config.empty

const point_reward_id = 2
let countQ = 0

const pool = dbConnection.getConnectionPool()

async function addProfileCompletedPoints () {
    const now = moment().utc().toISOString()
    let client = await pool.connect()
    const res_pt = await client.query(`SELECT point FROM mobijuce_loyalty_point_reward WHERE id = ${point_reward_id}`)
    const points_to_add = res_pt.rows[0].point
    client.release()

    client = await pool.connect()
    const sqlStr = "SELECT lp.client_id, lp.points as points, c.first_name as first_name, c.gender_id as gender_id, c.birth_date as birth_date, c.phone as phone, c.email as email FROM mobijuce_loyalty_points lp LEFT JOIN clients c ON c.id = lp.client_id LEFT JOIN mobijuce_loyalty_log ll ON ll.client_id = lp.client_id WHERE ll.client_id NOT IN (SELECT client_id FROM mobijuce_loyalty_log WHERE point_reward_id = 2) and (first_name is not null or first_name != '') and (gender_id is not null) and (birth_date is not null)";
    const res = await client.query(sqlStr)

    if (res) {
        let i = 0
        const len = res.rowCount
        // Loop to insert and update tables
        for (; i < len; i++) {
            let client_id = res.rows[i].client_id
            let point_o = res.rows[i].points
            let firstName = res.rows[i].first_name
            let genderId = res.rows[i].gender_id
            let birthDate = res.rows[i].birth_date

            if (firstName != null && genderId != null && birthDate != null) {
                // Insert into MOBIJUCE_LOYALTY_LOG
                let insertQuery = `INSERT INTO mobijuce_loyalty_log (client_id, created, updated, point_o, point_n, point_reward_id, product_redemption_id, buy_offer_id, daily_login_count, rent_record_id, transaction_id, is_redeemed) VALUES (${client_id}, '${now}', '${now}', ${point_o}, ${point_o} + ${points_to_add}, ${point_reward_id}, ${empty}, ${empty}, ${empty}, ${empty}, ${empty}, false)`;
                await client.query(insertQuery)

                // Update MOBIJUCE_LOYALTY_POINTS
                let updateQuery = `UPDATE mobijuce_loyalty_points SET points = points + ${points_to_add} where client_id = ${client_id}`;
                await client.query(updateQuery)
                countQ ++
                console.log(`Added ${points_to_add} to client ${client_id} at ${now}`)
                console.log(countQ, 'queries have been executed.')
                console.log('----------------------------------------')
            }
        }
    }
    client.release()
    console.log('----------------------------------------')
    console.log(`Connection ends at ${now}.`)
    console.log(`Total ${countQ} queries have been executed for profile completion.`)
    console.log('----------------------------------------')
}

module.exports = {
    addProfileCompletedPoints
}
