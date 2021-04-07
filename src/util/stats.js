const mysql = require('mysql');
const {
    promisify,
} = require('util');

const con = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB
});

const query = promisify(con.query.bind(con));

/**
 * @param {string} timeOption
 * @returns {Promise<[{}]>}
 */

function getData(timeOption) {
    let sql;
    // select * from table where table.id mod 5 = 0;
    if (timeOption == '24h') {
        // sql = 'SELECT totalRooms, totalOnline, statsTime FROM stats WHERE statsTime > DATE_SUB(CURDATE(), INTERVAL 1 DAY) and id mod 2 = 0';
        // sql = 'SET @Hours = HOUR(NOW()); SET @StartTime = DATE_SUB(CURDATE(), INTERVAL 1 DAY); SELECT totalRooms, totalOnline, statsTime FROM stats WHERE statsTime > DATE_ADD(@startTime, INTERVAL @Hours HOUR) AND id mod 2 = 0;'; 
        sql = 'SELECT totalRooms, totalOnline, statsTime FROM stats WHERE statsTime > DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 1 DAY), INTERVAL HOUR(NOW()) HOUR) AND id mod 2 = 0;'; 
        // 144 /2 = 72
    } else if (timeOption == '24h-o') {
        sql = 'SELECT totalRooms, totalOnline, statsTime FROM stats WHERE statsTime between DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 2 DAY), INTERVAL HOUR(NOW()) HOUR) AND DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 1 DAY), INTERVAL HOUR(NOW()) HOUR) AND id mod 2 = 0;'; 
    } else if (timeOption == 'week') {
        sql = 'SELECT totalRooms, totalOnline, statsTime FROM stats WHERE statsTime > DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 7 DAY), INTERVAL HOUR(NOW()) HOUR) AND id mod 14 = 0';
        // 144*7 / 14 = 72
    } else if (timeOption == 'week-o') {
        sql = 'SELECT totalRooms, totalOnline, statsTime FROM stats WHERE statsTime between DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 14 DAY), INTERVAL HOUR(NOW()) HOUR) AND DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 7 DAY), INTERVAL HOUR(NOW()) HOUR) AND id mod 14 = 0';
    } else if (timeOption == 'month') {
        sql = 'SELECT totalRooms, totalOnline, statsTime FROM stats WHERE statsTime > DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), INTERVAL HOUR(NOW()) HOUR) AND id mod 60 = 0';
        // 144 * 30 / 60 = 72
    } else if (timeOption == 'month-o') {
        sql = 'SELECT totalRooms, totalOnline, statsTime FROM stats WHERE statsTime between DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), INTERVAL HOUR(NOW()) HOUR) AND DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), INTERVAL HOUR(NOW()) HOUR) AND id mod 60 = 0';
    } else {
        // All time
        let startTime = new Date('1 Apr 2021').valueOf();
        let days = Math.ceil((Date.now() - startTime)/1000/60/60/24)
        sql = `SELECT totalRooms, totalOnline, statsTime FROM stats WHERE id mod ${days * 2} = 0`;

    }

    // const result = query(sql);
    // console.log("Ran Get Data | " + timeOption);
    // console.log("Ran Get Data RESULT: ", result);
    return query(sql);
}

module.exports = {
    getData,
};