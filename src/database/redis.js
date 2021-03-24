'use strict';

const Redis = require('ioredis');
const Logger = require('../util/Logger')
// const axios = require('axios')
require('dotenv').config()

Logger.reddis('Connected to reddis.')

const redisOptions = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASS,
    db: 0,
    connectionName: `dogegarden-stats`,
};

function createClient ( prefix, options = {} ) {
    const allOptions = {
        ...redisOptions,
        ...options,

        keyPrefix: `dogestats:${prefix}:`
    };

    return new Redis(allOptions);
}


// const test = async () => {
//     const clientTest = createClient(`test1`);
//     const multi = clientTest.multi();
//     multi.set(`first-test`, 123)
//     multi.set(`a`, 1);
//     multi.get(`a`);
//     multi.get(`first-test`);
//     return await multi.exec();
// }

// test().then(( ...args ) => console.log(...args));

// const test = async () => {
//     let data = await axios.get('http://localhost:7000/api/statistics')
//     // console.log(data.data)
//     const clientTest = createClient(`test1`);
//     const multi = clientTest.multi();
//     multi.set(`first-test`, 123)
//     multi.set(`a`, JSON.stringify(data));
//     multi.get(`a`);
//     multi.get(`first-test`);
//     return await multi.exec();
// }

// try {  
// test().then(( ...args ) => console.log(...args));
// } catch (e) {
//     console.log("Error in redis", e)
// }

module.exports = {
    createClient,
    // test,
};
