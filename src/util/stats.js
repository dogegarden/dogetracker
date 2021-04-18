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
        sql = 'SELECT DATE_FORMAT(statsTime, "%Y-%m-%d-%h") as queryDay, avg(totalOnline) as ave, min(totalOnline) as min, max(totalOnline) as max, avg(totalRooms) as aveR, min(totalRooms) as minR, max(totalRooms) as maxR FROM stats WHERE statsTime > DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 1 DAY), INTERVAL HOUR(NOW()) HOUR) GROUP BY DATE_FORMAT(statsTime, "%Y-%m-%d-%h"); '; 
    } else if (timeOption == 'week') {
        sql = 'SELECT DATE_FORMAT(statsTime, "%Y-%m-%d") as queryDay, avg(totalOnline) as ave, min(totalOnline) as min, max(totalOnline) as max, avg(totalRooms) as aveR, min(totalRooms) as minR, max(totalRooms) as maxR FROM stats WHERE statsTime > DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 7 DAY), INTERVAL HOUR(NOW()) HOUR) GROUP BY DATE_FORMAT(statsTime, "%Y-%m-%d"); ';
    } else if (timeOption == 'month') {
        sql = 'SELECT DATE_FORMAT(statsTime, "%Y-%m-%d") as queryDay, avg(totalOnline) as ave, min(totalOnline) as min, max(totalOnline) as max, avg(totalRooms) as aveR, min(totalRooms) as minR, max(totalRooms) as maxR FROM stats WHERE statsTime > DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), INTERVAL HOUR(NOW()) HOUR) GROUP BY DATE_FORMAT(statsTime, "%Y-%m-%d"); ';
    } else {
        // All time
        let daySplit = Math.ceil((Date.now()-new Date('4 Apr 2021').valueOf())/86400000/30); // /30 for number of days for modulus
        // let days = Math.ceil((Date.now() - startTime)/1000/60/60/24)
        // sql = `SELECT totalRooms, totalOnline, statsTime FROM stats WHERE id mod ${days * 2} = 0`;

        // New version, for every 30 days increase modulus by one so, <30, 1/month, 2/month, 3/month etc. >= 30 && < 60, 2/month, 4/month, etc. 3/m, 6/m .. 4/m, 8/m
        sql = 'SELECT DATE_FORMAT(statsTime, "%Y-%m-%d") as queryDay, avg(totalOnline) as ave, min(totalOnline) as min, max(totalOnline) as max, avg(totalRooms) as aveR, min(totalRooms) as minR, max(totalRooms) as maxR FROM stats WHERE DATE_FORMAT(statsTime, "%d") mod '+daySplit+' = 0 GROUP BY DATE_FORMAT(statsTime, "%Y-%m-%d"); ';
        // Todo: decide between days, weeks, months, even years
    }

    // const result = query(sql);
    // console.log("Ran Get Data | " + timeOption);
    // console.log("Ran Get Data RESULT: ", result);
    return query(sql);
}

module.exports = {
    getData,
};