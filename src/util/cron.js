const cron = require('node-cron');
const { createClient } = require('../database/redis');
const axios = require('axios')
const roomsClient = createClient(`rooms`);
const express = require('express')

app = express();

function setCron() {
    cron.schedule('*/10 * * * *', sendRedisData);
}

function sendRedisData() {
    console.log(`Sending data to redis database`);
    let redisExpire = 864000;
    try {
        axios.get('https://api.dogehouse.xyz/v1/popularRooms?dogestatsRedis')
            .then(async function (response) {
                const { rooms } = response.data;

                const multi = roomsClient.multi();
                const now = Date.now();

                for (let i = 0; i < rooms.length; ++i) {
                    let room = rooms[i];

                    const countKey = `${room.id}:count:${now}`;
                    const usersKey = `${room.id}:users:${now}`;
                    multi.sadd(countKey, room.numPeopleInside);
                    multi.expire(countKey, redisExpire)
                    multi.sadd(usersKey, room.peoplePreviewList.map(({ id }) => id));
                    multi.expire(usersKey, redisExpire)

                }
                const redisResult = await multi.exec();
                console.log(`by ID: meta - `, redisResult[0][1]);
                console.log(`by ID: count - `, redisResult[1][1]);
                console.log(`by ID: users - `, redisResult[2][1]);
            })
            .catch(function (error) {
                console.log(error);
            })
    } catch (e) {
        return console.log('Error in getting data from api')
    }
}

module.exports = {
    setCron,
};