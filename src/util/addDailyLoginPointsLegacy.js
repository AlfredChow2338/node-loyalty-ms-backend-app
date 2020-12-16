const dbConnection = require('./util/dbConnection')
const moment = require('moment')

const config = require('./data/config.json')
const empty = config.empty

let point_reward_id = 0
const point_reward_arr = [10, 11, 12, 13, 14, 15, 16]
let point_to_add = 0
let countQ = 0

const pool = dbConnection.getConnectionPool()

async function addDailyLoginPoints () {
    const now = moment().utc().toISOString()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

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
    const sqlStr = "select dlh.created::timestamp::date, dlh.client_id from mobijuce_daily_login_history dlh LEFT JOIN mobijuce_loyalty_points lp ON lp.client_id = dlh.client_id where dlh.created between (CURRENT_TIMESTAMP + INTERVAL '-14 day') and CURRENT_TIMESTAMP group by dlh.client_id, dlh.created::timestamp::date order by client_id, created desc"
    const res = await client.query(sqlStr)

    if (res) {
        const len = res.rowCount
        console.log(len)
        let i = 0
        let numLogin = 0

        for (; i < len; i ++) {
            let j = i + 1
            
            if (i == len - 1) {
                j --
            }
            // console.log('j', j)
            // console.log('i', i)
            let client_id = res.rows[i].client_id
            let next_client = res.rows[j].client_id

            const res_pt_new = await client.query(`SELECT points FROM mobijuce_loyalty_points WHERE client_id = ${client_id}`)
            let point_o = res_pt_new.rows[0].points

            let login_date = res.rows[i].created
            login_date.setHours(8,0,0,0)

            let next_date = res.rows[j].created
            next_date.setHours(8,0,0,0)

            console.log(client_id)
            console.log('login_date', login_date)
            console.log('last_date', next_date)
            
            // Check if dates are consecutive
            if (Date.parse(login_date) - Date.parse(next_date) === 86400000) {
                numLogin ++
            }
            console.log('numLogin', numLogin)

            // Check if it is next user or last user
            if (next_client != client_id) {
                const isToday = moment(login_date).isSame(today, 'day')

                // Check if the latest login date is today
                if (isToday) {
                    numLogin ++
                    // Check the nunmber of consecutive login days
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

                    console.log(point_reward_id)
                    console.log(point_to_add)
                    console.log('------------------------------------------');

                    // Insert data into mobijuce_loyalty_log
                    let insertQuery = `INSERT INTO mobijuce_loyalty_log (client_id, created, updated, point_o, point_n, point_reward_id, daily_login_count, buy_offer_id, rent_record_id, transaction_id, product_redemption_id, is_redeemed) VALUES (${client_id}, '${now}', '${now}', ${point_o}, ${point_o} + ${point_to_add}, ${point_reward_id}, ${numLogin}, ${empty}, ${empty}, ${empty}, ${empty}, false)`
                    // await client.query(insertQuery)

                    // Update points in mobijuce_loyalty_points
                    let updateQuery = `UPDATE mobijuce_loyalty_points SET points = points + ${point_to_add} where client_id = ${client_id}`
                    // await client.query(updateQuery)

                    countQ ++

                    console.log('----------------------------------------')
                    console.log(`Added ${point_to_add} to client ${client_id} at ${now}`)
                    console.log(countQ, 'queries have been executed.')
                }
                numLogin = 0
            }
        }
    }
    client.release()
    console.log('----------------------------------------')
    console.log(`Connection ends at ${now}.`)
    console.log(`Total ${countQ} queries have been executed for daily login.`)
    console.log('----------------------------------------')
}