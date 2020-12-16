const dbConnection = require("./util/dbConnection")
const moment = require('moment')
// const chalk = require('chalk')

const config = require('./data/config.json')
const empty = config.empty

const point_reward_id = 5
let point_to_add = 0
let countQ = 0

const pool = dbConnection.getConnectionPool()

async function addPurchasePoints () {
    const now = moment().toISOString()
    const client = await pool.connect()
    const sqlStr = "SELECT lp.client_id, lp.points, bol.bought_price, bol.id from mobijuce_loyalty_points lp left join buy_offer_logs bol on bol.client_id = lp.client_id where bol.id not in (select buy_offer_id from mobijuce_loyalty_log) and bol.created > '2020-11-21'"
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
            let price = res.rows[i].bought_price
            let buy_offer_id = res.rows[i].id
            let point_o = res.rows[i].points

            if (client_id == next_client) {
                const res_new_point_o = await client.query(`SELECT points FROM mobijuce_loyalty_points WHERE client_id = ${client_id}`)
                point_o = res_new_point_o.rows[0].points
            }

            if (parseInt(price) && price > 0) {
                point_to_add = await getRewardPoints(price)
                // Insert into MOBIJUCE_LOYALTY_LOG
                let insertQuery = `INSERT INTO mobijuce_loyalty_log (client_id, created, updated, point_o, point_n, point_reward_id, buy_offer_id, product_redemption_id, daily_login_count, rent_record_id, transaction_id, is_redeemed) VALUES (${client_id}, '${now}', '${now}', ${point_o}, ${point_o} + ${point_to_add}, ${point_reward_id}, ${buy_offer_id}, ${empty}, ${empty}, ${empty}, ${empty}, false)`
                // console.log(insertQuery)
                await client.query(insertQuery)

                // Update MOBIJUCE_LOYALTY_POINTS
                let updateQuery = `UPDATE mobijuce_loyalty_points SET points = points + ${point_to_add} where client_id = ${client_id}`
                // console.log(updateQuery)
                // console.log(chalk.green(point_o));
                await client.query(updateQuery)

                countQ ++

                console.log('----------------------------------------')
                console.log(`Added ${point_to_add} to client ${client_id} at ${now}`)
                console.log(countQ, 'queries have been executed.')
            }
        }
    }
    client.release()
    console.log('----------------------------------------')
    console.log(`Connection ends at ${now}.`)
    console.log(`Total ${countQ} queries have been executed for purchases.`)
    console.log('----------------------------------------')
}

async function getRewardPoints (price) {
    if (price) {
        return price * 0.5 * 100
    }
}

module.exports = {
    addPurchasePoints
}
