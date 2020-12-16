const dbConnection = require('../util/dbConnection.js');
const moment = require('moment');
const data = require('../points.json');

const now = moment().utc().toISOString();
const points_to_add = data.first_in_app_purchase;
const point_reward_id = 5;

async function addFirstPurchasePoints () {
    const sqlStr = 'SELECT lp.client_id, lp.points, count(bol.id) from mobijuce_loyalty_points lp left join buy_offer_logs bol on bol.client_id = lp.client_id where lp.client_id not in (select client_id from mobijuce_loyalty_log where point_reward_id = 5) group by lp.client_id, lp.points having count(bol.id) > 0';
    dbConnection.executeSQL(sqlStr)
    .then(async (result) => {
        let i = 0;
        const len = result.rowCount;

        for (; i < len; i ++) {
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

addFirstPurchasePoints();