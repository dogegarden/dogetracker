const Router = require('../classes/Router');
const axios = require('axios')
const { createClient } = require('../database/redis');
const roomsClient = createClient(`rooms`);
const usersClient = createClient(`users`);

// let redisCounter = 0;
// // redisMax * api time (seconds) for delay between each update to database
// // e.g redisMax = 30, api time = 10, = 300 second delay / 5 minutes.
// let redisMax = 30;

class API extends Router {
    constructor(client) {
        super(client, '/api');
    }
    createRoute() {

        this.router.get('/rooms', async (req, res) => {
            try {
                axios.get('https://api.dogehouse.xyz/v1/popularRooms?dogestats')
                .then(async function (response) {

                    res.json(response.data);

                    const { rooms } = response.data;

                    const multi = roomsClient.multi();
                    const now = Date.now();

                    for ( let i = 0; i < rooms.length; ++i ) {
                        let room = rooms[ i ];

                        const data = {
                            [`name`]: room.name,
                            [`description`]: room.description,
                            [`inserted_at`]: room.inserted_at,
                            [`creatorId`]: room.creatorId,
                            [`isPrivate`]: room.isPrivate,
                        };
                        // if (redisCounter >= redisMax) {
                        //     // Counter for long term data
                        //     const countKey = `${room.id}:count:${now}`;
                        //     const usersKey = `${room.id}:users:${now}`;
                        //     multi.sadd(countKey, room.numPeopleInside);
                        //     multi.sadd(usersKey, room.peoplePreviewList.map(({ id }) => id));
                        // }

                    }
                    // console.log(`redisCounter ${redisCounter} / redisMax ${redisMax}`)
                    // if (redisCounter >= redisMax) {
                    //     // Counter for long term data
                    //     const redisResult = await multi.exec();
                    //     console.log(`by ID: meta - `, redisResult[0][1]);
                    //     console.log(`by ID: count - `, redisResult[1][1]);
                    //     console.log(`by ID: users - `, redisResult[2][1]);
                    //     redisCounter = 0;
                    // } else {
                    //     redisCounter++;
                    // }
                })
                .catch(function (error) {
                    console.log(error);
                })
            } catch (e) {
                return res.redirect('/panel/settings?err=An error occurred.')
            }
        })
 
        this.router.get('/statistics', async (req, res) => {
            try {
                let statistics = await axios.get('https://api.dogehouse.xyz/v1/statistics?dogestats')
                let initRooms = await axios.get('https://api.dogehouse.xyz/v1/popularRooms?dogestats')
                let topRoom = initRooms.data.rooms[0]

                let newestRoom = initRooms.data.rooms.find(rooms => rooms.inserted_at == initRooms.data.rooms.map(it => it.inserted_at).sort()[initRooms.data.rooms.length-1])
                let longestRoom = initRooms.data.rooms.find(rooms => rooms.inserted_at == initRooms.data.rooms.map(it => it.inserted_at).sort()[0])
                let serverTime = new Date().valueOf();
                    let data = {
                        totalRooms: statistics.data.totalRooms,
                        totalOnline: statistics.data.totalOnline,
                        totalScheduled: statistics.data.totalScheduledRooms,
                        topRoom: {
                            name: topRoom.name,
                            description: topRoom.description,
                            listeners: topRoom.numPeopleInside,
                            id: topRoom.id,
                            created_at: topRoom.inserted_at
                        },
                        newestRoom: {
                            name: newestRoom.name,
                            description: newestRoom.description,
                            listeners: newestRoom.numPeopleInside,
                            id: newestRoom.id,
                            created_at: newestRoom.inserted_at
                        },
                        longestRoom: {
                            name: longestRoom.name,
                            description: longestRoom.description,
                            listeners: longestRoom.numPeopleInside,
                            id: longestRoom.id,
                            created_at: longestRoom.inserted_at
                        },
                        botAccounts: {
                            totalBotsOnline: statistics.data.botAccounts.totalBotsOnline
                        },
                        id: statistics.data.pid,
                        serverTime: serverTime
                    }
                    res.json(data);
            } catch (e) {
                console.log(e)
            }
        })

        this.router.get('/bots', async (req, res) => {
            try {
                let bots = await axios.get('https://api.dogehouse.xyz/v1/bots?dogestats')
                res.json(bots.data);
            } catch (e) {
                console.log(e)
            }
        })
        return this.router
    }
}

module.exports = API;