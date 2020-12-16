const dbConnection = require('./util/dbConnection')
const moment = require('moment')

const config = require('./data/config.json')
const empty = config.empty

let point_reward_id = 0
const point_reward_arr = [10, 11, 12, 13, 14, 15, 16]
let point_to_add = 0

const pool = dbConnection.getConnectionPool()

async function addDailyLoginPoints () {
    const now = moment().utc().toISOString()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let countQ = 0

    let client = await pool.connect()
    const res_pt = await client.query(`SELECT point FROM mobijuce_loyalty_point_reward WHERE id = ${point_reward_arr[0]} or id = ${point_reward_arr[1]} or id = ${point_reward_arr[2]} or id = ${point_reward_arr[3]} or id = ${point_reward_arr[4]} or id = ${point_reward_arr[5]} or id = ${point_reward_arr[6]} ORDER BY id`)
    const pt_day1 = res_pt.rows[0].point
    const pt_day2 = res_pt.rows[1].point
    const pt_day3 = res_pt.rows[2].point
    const pt_day4 = res_pt.rows[3].point
    const pt_day5 = res_pt.rows[4].point
    const pt_day6 = res_pt.rows[5].point
    const pt_day7 = res_pt.rows[6].point
    client.release()

    client = await pool.connect()
    const res_client  = await client.query(`SELECT client_id, points FROM mobijuce_loyalty_points where client_id IN (SELECT client_id FROM mobijuce_daily_login_history WHERE created between (CURRENT_TIMESTAMP + INTERVAL '-14 day') and CURRENT_TIMESTAMP group by client_id) ORDER BY client_id`)
    const len = res_client.rowCount
    let i = 0
    let numLogin = 0

    for (; i < len; i++) {
        const client_id = res_client.rows[i].client_id
        const point_o = res_client.rows[i].points

        const res = await client.query(`SELECT dlh.created::timestamp::date, dlh.client_id from mobijuce_daily_login_history dlh LEFT JOIN mobijuce_loyalty_points lp ON lp.client_id = dlh.client_id where dlh.client_id = ${client_id} group by dlh.client_id, dlh.created::timestamp::date order by created desc`)
        const len = res.rowCount
        let j = 0
        for (; j < len; j++) {
            let k = j + 1
            if (j == len - 1) {
                k --
            }

            let login_date = res.rows[j].created
            login_date.setHours(8,0,0,0)
            let last_date = res.rows[k].created
            last_date.setHours(8,0,0,0)

            if (Date.parse(login_date) - Date.parse(last_date) === 86400000) {
                numLogin ++
            } else {
                const n = j - numLogin
                const latestLogin = res.rows[n].created
                const isToday = moment(latestLogin).isSame(today, 'day')
                if (isToday) {
                    numLogin ++
                    switch (numLogin % 7) {
                        case 1 :
                            point_reward_id = point_reward_arr[0]
                            point_to_add = pt_day1
                            break
                        case 2 :
                            point_reward_id = point_reward_arr[1]
                            point_to_add = pt_day2
                            break
                        case 3 :
                            point_reward_id = point_reward_arr[2]
                            point_to_add = pt_day3
                            break
                        case 4 :
                            point_reward_id = point_reward_arr[3]
                            point_to_add = pt_day4
                            break
                        case 5 :
                            point_reward_id = point_reward_arr[4]
                            point_to_add = pt_day5
                            break
                        case 6 :
                            point_reward_id = point_reward_arr[5]
                            point_to_add = pt_day6
                            break
                        case 7 :
                            point_reward_id = point_reward_arr[6]
                            point_to_add = pt_day7
                            break
                    }
                    console.log('------------------------------------------');
                    console.log('point_reward_id', point_reward_id)
                    console.log('numLogin', numLogin)

                    // Insert data into mobijuce_loyalty_log
                    let insertQuery = `INSERT INTO mobijuce_loyalty_log (client_id, created, updated, point_o, point_n, point_reward_id, daily_login_count, buy_offer_id, rent_record_id, transaction_id, product_redemption_id, is_redeemed) VALUES (${client_id}, \'${now}\', \'${now}\', ${point_o}, ${point_o} + ${point_to_add}, ${point_reward_id}, ${numLogin}, ${empty}, ${empty}, ${empty}, ${empty}, false)`
                    console.log('insertQuery',insertQuery)
                    await client.query(insertQuery).catch(err => {
                        console.error('insert error')
                        console.error(err)
                    })

                    // Update points in mobijuce_loyalty_points
                    let updateQuery = `UPDATE mobijuce_loyalty_points SET points = points + ${point_to_add} where client_id = ${client_id}`
                    console.log('updateQuery',updateQuery)
                    await client.query(updateQuery).catch(err => {
                        console.error('update error')
                        console.error(err)
                    })
                    countQ ++
                }
                break
            }
        }
        console.log('numLogin', numLogin)
        console.log('client_id', client_id)
        numLogin = 0
        console.log('------------------------------------------');
    }
    client.release()
    console.log('----------------------------------------')
    console.log(`Connection ends at ${now}.`)
    console.log(`Total ${countQ} queries have been executed for daily login.`)
    console.log('----------------------------------------')
}



// addDailyLoginPoints()

module.exports = {
    addDailyLoginPoints
}
