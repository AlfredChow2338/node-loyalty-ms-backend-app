const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const dbConnection = require("./util/dbConnection");

async function init() {
    let taskPerWorker = Math.floor( await getNumberOfUser() / numCPUs)
    let start = 0
    let end = 0
    if (cluster.isMaster) {
        console.log(`Master ${process.pid} is running`);
        console.log('taskPerWorker : ', taskPerWorker)

        // Fork workers.
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
        });
    } else {
        const cluster_id = cluster.worker.id
        console.log('---------------------------------');
        console.log('Total no of user: ', taskPerWorker * numCPUs);
        console.log(`Worker ${process.pid} started`);
        console.log(`cluster id  ${cluster_id} started`);

        if (cluster_id === 1) {
            end = start + taskPerWorker
        } else {
            start += (cluster_id - 1) * taskPerWorker + (cluster_id - 1)
            end += start + taskPerWorker
        }

        console.log('start', start)
        console.log('end', end)
        const start_time = Date.now()
        console.log('start time', start_time);
        await addClients(start, end)
        const end_time = Date.now()
        console.log('end time',end_time);
        console.log('duration: ', (end_time - start_time))
        console.log('---------------------------------');
    }
}


async function addClients(start, end) {
    // Select clients without data in MOBIJUCE_LOYALTY_POINTS
    const sqlStr = `SELECT id FROM clients WHERE id NOT IN (SELECT client_id FROM mobijuce_loyalty_points) and id BETWEEN ${start} AND ${end} GROUP BY id`;
    dbConnection.executeSQL(sqlStr)
        .then(async (result) => {
            let i = 0;
            const len = result.rowCount;

            // Loop to insert clients data into LOYALTY_POINTS
            for (; i < len; i++) {
                let client_id = result.rows[i].id;
                let insertQuery = `INSERT INTO mobijuce_loyalty_points (points, client_id) VALUES (0, ${client_id})`;
                dbConnection.executeSQL(insertQuery);
            }
        })
}

async function getNumberOfUser() {
    // Select clients without data in MOBIJUCE_LOYALTY_POINTS
    const sqlStr = "SELECT id FROM clients WHERE id NOT IN (SELECT client_id FROM mobijuce_loyalty_points)";
    const result = await dbConnection.executeSQL(sqlStr)
    return result.rowCount
}
async function start(){
    const start_time = Date.now()
    console.log('start time', start_time);
    await init()
    const end_time = Date.now()
    console.log('end time',end_time);
    console.log('duration: ', (end_time - start_time))
}

// start()
init()