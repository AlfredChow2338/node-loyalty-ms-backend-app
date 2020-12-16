const dbConnection = require("./dbConnection")
const fastcsv = require("fast-csv")
const fs = require("fs")
const moment = require("moment")
const date = moment().format().replace(/:/g, '-')
const ws = fs.createWriteStream(`registration_${date}.csv`)

async function getLatest() {
    const result = dbConnection.executeSQL("select * from loyalty_log")
    result.then((result) => {
        let jsonRows = JSON.parse(JSON.stringify(result.rows))
        fastcsv.write(jsonRows, { headers: true })
        .on("finish", function() {
            console.log("Table exported successfully")
        })
        .pipe(ws)
    })
}

getLatest()

module.exports = {
    getLatest
}