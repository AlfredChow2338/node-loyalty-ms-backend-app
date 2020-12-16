const dbConnection = require('./util/dbConnection')
const moment = require('moment')

const config = require('./data/config.json')
const empty = config.empty

let point_reward_id = 0
const point_reward_arr = [17, 18, 19, 20, 21]
let point_to_add = 0
let countQ = 0

const pool = dbConnection.getConnectionPool()

async function addRentalPoints () {
    const now = moment().toISOString()
    let client = await pool.connect()
    const res_pt = await client.query(`SELECT point FROM mobijuce_loyalty_point_reward WHERE id = ${point_reward_arr[0]} or id = ${point_reward_arr[1]} or id = ${point_reward_arr[2]} or id = ${point_reward_arr[3]} or id = ${point_reward_arr[4]} order by id`)
    const point_below_1_hr = res_pt.rows[0].point
    const point_below_2_hr = res_pt.rows[1].point
    const point_below_3_hr = res_pt.rows[2].point
    const point_below_4_hr = res_pt.rows[3].point
    const point_below_72_hr = res_pt.rows[4].point
    client.release()

    client = await pool.connect()
    const sqlStr = "SELECT lp.points, lp.client_id, rr.duration, rr.id AS rental_id FROM mobijuce_loyalty_points lp LEFT JOIN rent_records rr ON rr.client_id = lp.client_id LEFT JOIN shops s ON s.id = rr.out_shop_id WHERE rr.created > '2020-11-19' and rr.id NOT IN (SELECT rent_record_id FROM mobijuce_loyalty_log) and rr.rental_status = 'success' and s.country_code = 'HK'"
    const res = await client.query(sqlStr)
    if (res) {
        const len = res.rowCount
        let i = 0

        for (; i < len; i++) {
            let j = i + 1;
            if (i == len -1) {
                j = i
            }
            let client_id = res.rows[i].client_id
            let next_client = res.rows[j].client_id
            let duration = res.rows[i].duration
            let rent_record_id = res.rows[i].rental_id
            let point_o = res.rows[i].points

            if (client_id == next_client) {
                const res_new_point_o = await client.query(`SELECT points FROM mobijuce_loyalty_points WHERE client_id = ${client_id}`)
                point_o = res_new_point_o.rows[0].points
            }

            if (duration && parseInt(duration)) {
                if (duration <= 60) {
                    point_reward_id = point_reward_arr[0]
                    point_to_add = point_below_1_hr
                } else if (duration <= 120) {
                    point_reward_id = point_reward_arr[1]
                    point_to_add = point_below_2_hr
                } else if (duration <= 180) {
                    point_reward_id = point_reward_arr[2]
                    point_to_add = point_below_3_hr
                } else if (duration <= 240) {
                    point_reward_id = point_reward_arr[3]
                    point_to_add = point_below_4_hr
                } else {
                    point_reward_id = point_reward_arr[4]
                    point_to_add = point_below_72_hr
                }

                // Insert into MOBIJUCE_LOYALTY_LOG
                let insertQuery = `INSERT INTO mobijuce_loyalty_log (client_id, created, updated, point_o, point_n, point_reward_id, rent_record_id, product_redemption_id, buy_offer_id, daily_login_count, transaction_id, is_redeemed) VALUES (${client_id}, '${now}', '${now}', ${point_o}, ${point_o} + ${point_to_add}, ${point_reward_id}, ${rent_record_id}, ${empty}, ${empty}, ${empty}, ${empty}, false)`;
                await client.query(insertQuery);

                // Update MOBIJUCE_LOYALTY_POINTS
                let updateQuery = `UPDATE mobijuce_loyalty_points SET points = points + ${point_to_add} where client_id = ${client_id}`;
                await client.query(updateQuery);

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
    console.log(`Total ${countQ} queries have been executed for rental.`)
    console.log('----------------------------------------')
}

module.exports = {
    addRentalPoints
}
