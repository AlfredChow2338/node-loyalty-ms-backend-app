const dbConnection = require('./dbConnection')
const moment = require('moment')
const now = moment().toISOString()
const expDate = moment().add(365, 'days').toISOString()

const client = dbConnection.getClient()
client.connect()

let point_reward_id = 0
let points_to_add = 0

// // Promise basics
// const promise1 = new Promise((resolve, reject) => {
//     const a = 1 + 2
//     if (a === 2){
//         resolve('success')
//     } else {
//         reject('failed ')
//     }
// })

// promise1.then((msg) => {
//     console.log(msg)
// }).catch((msg) => {
//     console.log(msg)
// })

// const promise2 = new Promise((resolve, reject) => {
//     resolve('promise2 succeed')
// })

// const promise3 = new Promise((resolve, reject) => {
//     resolve('promise3 succeed')
// })

// const promise4 = new Promise((resolve, reject) => {
//     resolve('promise4 succeed')
// })

// Promise.all([
//     promise2,
//     promise3,
//     promise4
// ]).then((msg) => {
//     console.log(msg)
// })

// Promise.race([
//     promise2,
//     promise3,
//     promise4
// ]).then((msg) => {
//     console.log(msg)
// })
 


// // Return a promise in a function 
// function makeRequest(location) {
//     console.log(`Making a request to ${location}`)
//     return new Promise((resolve, reject) => {
//         if (location === "Facebook") {
//             resolve('Facebook welcomes you!')
//         } else {
//             reject(`Fuck ${location}`)
//         }
//     })
// }

// function processeRequest(response) {
//     return new Promise((resolve, reject) => {
//         console.log("Processing request")
//         resolve(`Extra information for ${response}`)
//     })
// }

// makeRequest('Facebook').then((response) => {
//     console.log('Facebook received')
//     return processeRequest(response)
// })



// // Use arrow function to get a local class variable
// class Person {
//     constructor(name) {
//         this.name = name;
//     }
    
//     getNameFunction() {
//         setTimeout(function() {
//             console.log('Function: ' + this.name)
//         }, 100)
//     }

//     getNameArrow() {
//         setTimeout(() => {
//             console.log('Arrow: ' + this.name)
//         }, 100)
//     }
// }

// let person = new Person('Bob')
// person.getNameArrow();
// person.getNameFunction();

// // Variable for adding points every day
//             // const login_time = record.created_dt
//             // const isSameDay = moment().isSame(login_time, 'Day')
//             // const isSameMonth = moment().isSame(login_time, 'Month')
//             // const isSameYear = moment().isSame(login_time, 'Year')

//             if (count_login === 10) {
//                 dbConnection.executeSQL(`UPDATE loyalty SET daily_login_points = true, daily_login_points_updated = '${now}' where id = ${id}`)
//             }
//             else if (isSameDay && isSameMonth && isSameYear && count_login === count_login_max && daily_login_points === false) {
//                 dbConnection.executeSQL(`UPDATE loyalty SET point = point + 10, count_login = count_login + 1, count_login_max = count_login_max + 1, daily_login_points_updated = '${now}' where id = ${id}`)
//             } else if (isSameDay && isSameMonth && isSameYear && count_login < count_login_max && daily_login_points === false) {
//                 dbConnection.executeSQL(`UPDATE loyalty SET count_login = count_login + 1, daily_login_points_updated = '${now}' where id = ${id}`)
//             } else {
//                 dbConnection.executeSQL(`UPDATE loyalty SET count_login = 0, daily_login_points_updated = '${now}' where id = ${id}`)
//             }

// const data = require('./points.json');
// console.log(data.account_created);

async function insertRows () {
    // const insertSql = `INSERT INTO mobijuce_loyalty_point_reward (id, created, updated, point, name_zho, campaign_name, country_id, is_enabled) VALUES (9999999, '${now}', '${now}', 0, 'empty', 'Mobijuce', -1, true)`
    // const expDate = moment().add(365, 'days').toISOString()
    // const insertSql = `INSERT INTO mobijuce_loyalty_product_redemption (created, updated, expiry_date, point, product_name_zho, product_name_eng, product_name_chi, is_redeemable, quantity, redeem_type, description_chi, description_eng, description_zho, tnc_chi, tnc_eng, tnc_zho, start_date, end_date, redeem_code) VALUES ('${now}', '${now}', '${expDate}', 0, 'test product 2', 'test product 2', 'test product 2', true, 10000, 'code', 'Description', 'Description', 'Description', 'TNC', 'TNC', 'TNC', '${now}', '${expDate}', 9527)`
    // const today = moment.toISOString()

    // // Test for daily login history
    let i = 0;
    const streak = 5
    for (; i < streak; i ++) {
        let date = moment().subtract(i, 'days').toISOString()
        const insertSql = `INSERT INTO mobijuce_daily_login_history (created, client_id) VALUES ('${date}', 9527)`
        console.log('Inserted', date, 'into daily login history.')
        await client.query(insertSql)
    }

    // const insertSql = `INSERT INTO mobijuce_daily_login_history (created, client_id) VALUES ('${date}', 31525)`
    // const insertSql = `INSERT INTO mobijuce_loyalty_tasks (created)`
    // await client.query(insertSql)
    // console.log('Inserted data at ' + now)
    // console.log('Total', i, 'queries have been executed.')
    client.end()
}



async function deleteRows () {
    // const deleteSql = `DELETE FROM mobijuce_loyalty_log WHERE id >= 142611`
    // const deleteSql = `DELETE FROM mobijuce_loyalty_point_reward`
    const deleteSql = 'DELETE FROM mobijuce_daily_login_history WHERE id = 904 or id = 951' 
    
    await client.query(deleteSql)
    console.log('Deleted table data.')
    client.end()
}

async function updateRows () {
    const date = moment().add(365, 'days').toISOString()
    // const updateSql = `UPDATE mobijuce_loyalty_points SET points = 964300 where client_id = 25293`
    // const updateSql = `UPDATE wallets SET balance = 282 where client_id = 25293`
    // const updateSql = `UPDATE clients SET first_name = 'Jack Jack Jack' where id = 25293`
    // const updateSql = `UPDATE mobijuce_loyalty_point_reward SET country_id = 9999, updated = '${now}' WHERE country_id = -1`
    const updateSql = `UPDATE mobijuce_loyalty_product_redemption SET product_name_eng = 'test 3 test 3 test 3 test 3 test 3 test 3' WHERE id = 3`
    // const updateSql = `UPDATE mobijuce_loyalty_point_reward SET name_chi = name_zho, name_eng = name_zho`
    // const updateSql = `UPDATE mobijuce_loyalty_product_redemption SET start_date = '${now}', end_date = '${date}'`
    // const updateSql = `UPDATE mobijuce_loyalty_product_redemption SET product_name_zho = 'test product zho', product_name_eng = 'test product eng', product_name_chi = 'test product chi', description_chi = 'description chi', description_eng = 'description eng', description_zho = 'description zho', tnc_chi = 'tnc chi', tnc_eng = 'tnc eng', tnc_zho = 'tnc zho', redeem_code = 9527`
    await client.query(updateSql)
    console.log('Updated data at', now);
    client.end()
}

async function test () {
    const sql = "select dlh.created, dlh.client_id, lp.points from mobijuce_daily_login_history dlh LEFT JOIN mobijuce_loyalty_points lp ON lp.client_id = dlh.client_id order by client_id, created"
    dbConnection.executeSQL(sql)
    .then(async result => {
        let i = 0
        let j = 1
        let numLogin = 0
        let len = result.rowCount

        for (; i < len, j < len; i ++, j++) {
            let point_o = result.rows[i].points
            let client_id = result.rows[i].client_id
            let next_client = result.rows[j].client_id
            let login_date = result.rows[i].created
            let next_date = result.rows[j].created

            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            login_date.setHours(0,0,0,0)
            next_date.setHours(0,0,0,0)

            // Check if dates are consecutive
            if (Date.parse(next_date) - Date.parse(login_date) == 86400000) {
                numLogin ++
            }

            // Check if it is next user or last user
            if (client_id != next_client || j === len - 1) {
                console.log("client_id " + client_id)
                console.log("point_o " + point_o)
                const isToday = moment(login_date).isSame(today, 'day');

                // Check if the latest login date is today
                if (isToday) {

                    // Check the nunmber of consecutive login days
                    switch (numLogin % 7) {
                        case 1 :
                            points_to_add = data.d1_daily_login
                            point_reward_id = 10
                            break;
                        case 2 :
                            points_to_add = data.d2_daily_login
                            point_reward_id = 11
                            break;
                        case 3 :
                            points_to_add = data.d3_daily_login
                            point_reward_id = 12
                            break;
                        case 4 :
                            points_to_add = data.d4_daily_login
                            point_reward_id = 13
                            break;
                        case 5 :
                            points_to_add = data.d5_daily_login
                            point_reward_id = 14
                            break;
                        case 6 :
                            points_to_add = data.d6_daily_login
                            point_reward_id = 15
                            break;
                        case 7 :
                            points_to_add = data.d7_daily_login
                            point_reward_id = 16
                            break;
                    }

                    // Add one starting day
                    numLogin ++

                    console.log("numLogin " + numLogin)
                    console.log('points_to_add ' + points_to_add)
                    console.log(('point_reward_id ' + point_reward_id))

                    // Insert data into mobijuce_loyalty_log
                    let insertQuery = `INSERT INTO mobijuce_loyalty_log (client_id, created, updated, point_o, point_n, point_reward_id, daily_login_count, buy_offer_id, rent_record_id, transaction_id, product_redemption_id) VALUES (${client_id}, '${now}', '${now}', ${point_o}, ${point_o} + ${points_to_add}, ${point_reward_id}, ${numLogin} + 1, -1, -1, -1, -1)`
                    await dbConnection.executeSQL(insertQuery)
                    
                    // Update points in mobijuce_loyalty_points
                    let updateQuery = `UPDATE mobijuce_loyalty_points SET points = points + ${points_to_add} where client_id = ${client_id}`
                    await dbConnection.executeSQL(updateQuery)

                } else {
                    numLogin = 0
                    points_to_add = 0
                    point_reward_id = -1
                    console.log("numLogin " + numLogin)
                    console.log('points_to_add ' + points_to_add)
                    console.log(('point_reward_id ' + point_reward_id))
                }

                console.log('-----------------------------------------')
                numLogin = 0
            }
        }
    })
}

async function cluster () {
    const http = require('http')
    const cluster = require('cluster')
    const cpus = require('os').cpus()
    let i = 0
    if (cluster.isMaster) {
        console.log('Master process ', process.pid)
        for (; i < cpus.length; i++) {
            cluster.fork()
        }
    } else {
        http.createServer((req, res) => {
            const message = `Worker: ${process.pid}`
            console.log(message)
            console.log(cluster.worker.id)
            res.end(message)
        }).listen(3001)
    }
    // console.log(cpus)
}

async function os () {
    const os = require('os').platform()
    
    console.log(os)
}

async function qs () {
    const express = require('express')
    const app = express()
    const querystring = require('querystring');
    
    app.get('/', (req, res) => {
        // res.send('Hello ' + req.params.name)
        res.send(req.query)
    })

    app.listen(3002)
}

async function addTopUpRows () {
    const sqlStr = `INSERT INTO transactions (created, updated, created_by, updated_by, reference, amount, remarks, client_id, currency_id, payment_method_id, transaction_type_id, status_id, rate, juce_dollar) VALUES ('${now}', '${now}', 0, 0, 'Topup', 100, 'Loyalty Testing', 35126, 1, 4, 7, 2, 1, 0.00)`
    await client.query(sqlStr)
    client.end()
    console.log('Connection ends at', now)
}

async function addRentRecordRows () {
    const sqlStr = `INSERT INTO public.rent_records(
        created, updated, created_by, updated_by, start_time, rent_success, send_push, end_time, duration, overtime_paid, client_id, in_jucebox_id, in_shop_id, jucepac_id, out_jucebox_id, out_shop_id, rental_status, in_jucenode_id, out_jucenode_id, payment_type_id, coupon_amount, currency_id, rental_amount, created_dt, release_timestamp, return_timestamp, void_record, deleted, is_using_credit_card, addition_fee)
        VALUES ('${now}', '${now}', 35126, 0, '${now}', false, true, '${now}', 2304, false, 35126, 342, 212, 3612, 342, 212, 'success', 10902, 10902, 1, 0.00, 1, 20.00, '${now}', 1605098327, 1605148893, false, false, true, 0.00)`
        await client.query(sqlStr)
        client.end()
        console.log('Connection ends at', now)
}

async function addBuyOfferLog () {
    const sqlStr = `INSERT INTO buy_offer_logs (created, updated, created_by, updated_by, quantity, client_id, offer_id, display, bought_price) VALUES ('${now}', '${now}', 0, 0, 1, 35126, 1047, true, 399.00)`
    await client.query(sqlStr)
    console.log('Connection ends at', now)
    client.end()
}

async function insertTasks () {
    const insertSql = `INSERT INTO mobijuce_loyalty_tasks (created, updated, name_zho, name_eng, name_chi, weight, is_visible) VALUES ('${now}', '${now}', 'Top-up (for charging)', 'Top-up (for charging)', 'Top-up (for charging)', 85, true)`
    await client.query(insertSql)
    console.log('Inserted data at ' + now)
    client.end()
}

async function profileCompleted () {
    const sqlStr = `SELECT count(id) FROM mobijuce_loyalty_log WHERE client_id`
}

deleteRows()
// test()
// insertRows()
// updateRows()
// cluster()
// qs()
// addTopUpRows()
// addRentRecordRows()
// addBuyOfferLog()
// insertTasks()