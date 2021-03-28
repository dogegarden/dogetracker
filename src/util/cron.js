const cron = require('node-cron');
const axios = require('axios')
const mysql = require('mysql');
const Logger = require('../util/Logger')

function setCron() {
    cron.schedule('*/10 * * * *', saveMYSQL);
}

function saveMYSQL() {
    var con = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB
    });

    con.connect(async function (err) {
        if (err) throw err;
        Logger.mysql(`Connected`);
        let data;
        try {
            data = await axios.get('https://api.dogehouse.xyz/v1/popularRooms?mysql')
            data = data.data;
            let sql = 'INSERT IGNORE INTO users (uuid, numFollowers, displayName) VALUES ';
            for (j = 0; j < data.rooms.length; j++) {
                for (i = 0; i < data.rooms[j].peoplePreviewList.length; i++) {
                    sql += '("' + data.rooms[j].peoplePreviewList[i].id + '", ' + data.rooms[j].peoplePreviewList[i].numFollowers + ', "' + data.rooms[j].peoplePreviewList[i].displayName + '"), ';
                }
            }
            sql = sql.slice(0, sql.length - 2);

            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("users inserted");
            });

            sql = 'INSERT IGNORE INTO rooms (id, creatorId, description, insertedAt, roomName, numPeopleInside) VALUES ';
            for (i = 0; i < data.rooms.length; i++) {
                sql += '("' + data.rooms[i].id + '", "' + data.rooms[i].creatorId + '", "' + data.rooms[i].description + '", "' + data.rooms[i].inserted_at + '", "' + data.rooms[i].name + '", ' + data.rooms[i].numPeopleInside + '), ';
            }
            sql = sql.slice(0, sql.length - 2);

            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("rooms inserted");
            });
        } catch (e) {
            return console.log('Error in getting data from api')
        }
    });
}

module.exports = {
    setCron,
};