const cron = require('node-cron');
const axios = require('axios')
const mysql = require('mysql');
const Logger = require('../util/Logger')

function setCron() {
    // Execute every 10 minutes
    cron.schedule('*/10 * * * *', saveMYSQL);
}

function autoRunMYSQL() {
    Logger.info(`Starting with autorun MYSQL`);
    saveMYSQL();
}

function saveMYSQL() {
    var con = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB
    });

    con.connect(async function (err) {
        if (err) throw err;
        Logger.mysql(`Connected`);
        let data;
        try {
            data = await axios.get('https://api.dogegarden.net/v1/popularRooms?mysql')
            data = data.data;
            // let sql = 'INSERT IGNORE INTO users (uuid, numFollowers, displayName) VALUES ';
            // for (j = 0; j < data.rooms.length; j++) {
            //     for (i = 0; i < data.rooms[j].peoplePreviewList.length; i++) {
            //         sql += `('${data.rooms[j].peoplePreviewList[i].id}', '${data.rooms[j].peoplePreviewList[i].numFollowers}', '${data.rooms[j].peoplePreviewList[i].displayName.replace(/"/g, '\\\"').replace(/'/g, '\\\'')}'), `;
            //     }
            // }
            // sql = sql.slice(0, sql.length - 2);

            // con.query(sql, function (err, result) {
            //     if (err) throw err;
            //     console.log("users inserted");
            // });
            if (data.rooms === undefined || data.rooms.rooms) { 
                Logger.mysql("Rooms undefined, check API endpoint");
            } else {
                sql = 'INSERT IGNORE INTO rooms (id, creatorId, roomDescription, insertedAt, roomName, numPeopleInside) VALUES ';
                for (i = 0; i < data.rooms.length; i++) {
                    sql += `('${data.rooms[i].id}', '${data.rooms[i].creatorId}', '${data.rooms[i].description.replace(/"/g, '\\\"').replace(/'/g, '\\\'')}', '${data.rooms[i].inserted_at}', '${data.rooms[i].name.replace(/"/g, '\\\"').replace(/'/g, '\\\'')}', '${data.rooms[i].numPeopleInside}'), `;
                }
                sql = sql.slice(0, sql.length - 2);

                con.query(sql, function (err, result) {
                    if (err) throw err;
                    Logger.mysql("Rooms inserted");
                });
            }

            data = await axios.get('https://stats.dogegarden.net/api/statistics?mysql')
            data = data.data;
            if (data.totalRooms === undefined) { 
                Logger.mysql("Total Rooms undefined, check API endpoint");
            } else {
                sql = `INSERT INTO stats (totalRooms, totalScheduledRooms, totalOnline, totalBotsOnline, totalBotsSendingTelemetry, topRoomID, newestRoomID, longestRoomID) VALUES (${data.totalRooms}, ${data.totalScheduled}, ${data.totalOnline}, ${data.totalBotsOnline}, ${data.totalBotsSendingTelemetry}, '${data.topRoom.id}', '${data.newestRoom.id}', '${data.longestRoom.id}')`;
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    Logger.mysql("Stats inserted");
                });
            }
        } catch (e) {
            return console.error('Error in getting data from api', e)
        }
    });
    // Bots
    /*
    let uniqueBots = [];

    for (i=0;i<json.bots.length;i++) {
        if (uniqueBots.indexOf(json.bots[i].socket_id) == -1) {
            uniqueBots.push(json.bots[i].socket_id)
        }
    }
    // reconstruct by searching with socket id.


    */
}

module.exports = {
    setCron,
    autoRunMYSQL,
};
