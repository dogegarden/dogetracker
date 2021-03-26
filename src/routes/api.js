const Router = require('../classes/Router');
const axios = require('axios')

class API extends Router {
    constructor(client) {
        super(client, '/api');
    }
    createRoute() {

        this.router.get('/statistics', async (req, res) => {
            try {
                let statistics = await axios.get('https://api.dogehouse.xyz/v1/statistics?dogestats')
                let initRooms = await axios.get('https://api.dogehouse.xyz/v1/popularRooms?dogestats')
                let topRoom = initRooms.data.rooms[0]

                let newestRoom = initRooms.data.rooms.find(rooms => rooms.inserted_at == initRooms.data.rooms.map(it => it.inserted_at).sort()[initRooms.data.rooms.length - 1])
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
                    totalBotsOnline: statistics.data.totalBotsOnline,
                    totalBotsSendingTelemetry: statistics.data.totalBotsSendingTelemetry,
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