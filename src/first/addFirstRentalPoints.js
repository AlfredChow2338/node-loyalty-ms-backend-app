const dbConnection = require('./dbConnection')
const moment = require('moment')
const data = require('./points.json');
// const fs = require('fs')
// const fastCsv = require('fast-csv')
// const date = moment().format().replace(/:/g, '-')
// const ws = fs.createWriteStream(`addFirstRentalPoints_${date}.csv`) 

async function addFirstRentalPoints() {
    const sqlStr = "SELECT lp.client_id, lp.points, count(rr.id) FROM mobijuce_loyalty_points lp LEFT JOIN rent_records rr ON rr.client_id = lp.client_id WHERE lp.client_id NOT IN (SELECT client_id FROM mobijuce_loyalty_log where point_reward_id = 4) group by lp.client_id, lp.points having count(rr.id) > 0";
    dbConnection.executeSQL(sqlStr)
    .then((result) => {
        let i = 0;
        let len = result.rowCount;
        const now = moment().utc().toISOString();
        const points_to_add = data.first_rental;
        const point_reward_id = 4;

        // Loop to insert and update tables
        for (i = 0; i < len; i++) {
            let client_id = result.rows[i].client_id;
            let numRecords = result.rows[i].count;

            if (numRecords > 0) {
                // Insert into MOBIJUCE_LOYALTY_LOG
                let insertQuery = `INSERT INTO mobijuce_loyalty_log (client_id, created, updated, point_o, point_n, point_reward_id) VALUES (${client_id}, '${now}', '${now}', ${point_o}, ${point_o} + ${points_to_add}, ${point_reward_id})`;
                dbConnection.executeSQL(insertQuery);

                // Update MOBIJUCE_LOYALTY_POINTS
                let updateQuery = `UPDATE mobijuce_loyalty_points SET points = points + ${points_to_add} where client_id = ${client_id}`;
                await dbConnection.executeSQL(updateQuery);
            }
        }
    })
}

addFirstRentalPoints();

module.exports = {
    addFirstRentalPoints,
}