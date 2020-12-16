const schedule = require("node-schedule");
const client = require('../addClients')
const registeration = require('../addRegistrationPoints')
const profileCompletion = require('../addProfileCompletedPoints')
const topup = require('../addTopupPoints')
const rental = require('../addRentalPoints')
const purchases = require('../addPurchasePoints')
const dailyLogin = require('../addDailyLoginPoints')

function scheduleCronHalfHour() {
    console.log("scheduleCronHalfHour => scheduleJob")
    schedule.scheduleJob("*/15 * * * *", async () => {
        console.log(`scheduleCronHalfHour() => start @ ${new Date()}`)
        try {
            await client.addClientsPoints()
            await registeration.addRegisterationPoints()
            await profileCompletion.addProfileCompletedPoints()
            await topup.addTopUpPoints()
            await rental.addRentalPoints()
            await purchases.addPurchasePoints()
        } catch (e) {
            console.error(e)
        }
    })
}

function scheduleCronDaily() {
    console.log("scheduleCronDaily => scheduleJob")
    schedule.scheduleJob("58 23 * * *", function () {
        console.log("scheduleCronDaily() => start")
        console.log(`scheduleCronDaily() => start @ ${new Date()}`)
        dailyLogin.addDailyLoginPoints()
    })
}

console.log("schedule.js => start")
scheduleCronHalfHour();
scheduleCronDaily();
