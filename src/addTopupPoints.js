const dbConnection = require("./util/dbConnection")
const moment = require('moment')

const config = require('./data/config.json')
const { keyword } = require("chalk")
const empty = config.empty

let point_reward_id = 0
let point_reward_arr = [7, 8, 9]
let points_to_add = 0
let countQ = 0

const pool = dbConnection.getConnectionPool()

async function addTopUpPoints () {
    const now = moment().toISOString()
    let client = await pool.connect()
    const res_pt = await client.query(`SELECT point FROM mobijuce_loyalty_point_reward WHERE id = ${point_reward_arr[0]} or id = ${point_reward_arr[1]} or id = ${point_reward_arr[2]} ORDER BY id`)
    const points_to_add_20 = res_pt.rows[0].point
    const points_to_add_50 = res_pt.rows[1].point
    const points_to_add_above_50 = res_pt.rows[2].point
    client.release()

    client = await pool.connect()
    const sqlStr = "SELECT lp.points, lp.client_id, (t.amount / t.rate) as amount , t.id AS transaction_id FROM mobijuce_loyalty_points lp LEFT JOIN transactions t ON t.client_id = lp.client_id WHERE t.created > '2020-11-19' and t.id NOT IN (SELECT transaction_id FROM mobijuce_loyalty_log) and t.status_id = 2 and t.transaction_type_id = 7 order by lp.client_id"
    const res = await client.query(sqlStr)
    if (res) {
        const len = res.rowCount
        let i = 0
        for (; i < len; i++) {
            let client_id = res.rows[i].client_id
            let j = i + 1
            // Handle next client that exceeds maximum row count
            if (i == len - 1) {
                j = i
            }
            let next_client = res.rows[j].client_id
            let point_o = res.rows[i].points
            let amount = Math.floor(res.rows[i].amount)
            let transaction_id = res.rows[i].transaction_id

            if (client_id == next_client) {
                const res_new_point_o = await client.query(`SELECT points FROM mobijuce_loyalty_points WHERE client_id = ${client_id}`)
                point_o = res_new_point_o.rows[0].points
            }

            // Handle different top up amount
            if (client_id && amount) {
                if ( amount == 20) {
                    point_reward_id = point_reward_arr[0]
                    points_to_add = points_to_add_20
                } else if (amount == 50) {
                    point_reward_id = point_reward_arr[1]
                    points_to_add = points_to_add_50
                } else if (amount >= 50.00)  {
                    point_reward_id = point_reward_arr[2]
                    points_to_add = points_to_add_above_50
                }

                // Insert into MOBIJUCE_LOYALTY_LOG
                let insertQuery = `INSERT INTO mobijuce_loyalty_log (client_id, created, updated, point_o, point_n, point_reward_id, transaction_id, product_redemption_id, buy_offer_id, daily_login_count, rent_record_id, is_redeemed) VALUES (${client_id}, '${now}', '${now}', ${point_o}, ${point_o} + ${points_to_add}, ${point_reward_id}, ${transaction_id}, ${empty}, ${empty}, ${empty}, ${empty}, false)`
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
    console.log(`Total ${countQ} queries have been executed for top up.`)
    console.log('----------------------------------------')
}

module.exports = {
    addTopUpPoints
}
