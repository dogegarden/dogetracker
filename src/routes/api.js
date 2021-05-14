const Router = require('../classes/Router');
const axios = require('axios')
const Stats = require('../util/stats');

class API extends Router {
    constructor(client) {
        super(client, '/api');
    }
    createRoute() {

        this.router.get('/statistics', async (req, res) => {
            try {
                let statistics = await axios.get('https://api.dogegarden.net/v1/statistics?dogestats')
                let initRooms = await axios.get('https://api.dogegarden.net/v1/popularRooms?dogestats')
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
                    totalRegistered: statistics.totalRegistered,
                    activeInLastTwoDays: statistics.activeInLastTwoDays,
                    id: statistics.data.pid,
                    serverTime: serverTime
                }
                res.json(data);
            } catch (e) {
                console.log(e)
            }
        })

        this.router.get('/version', async (req, res) => {
            try {
                let packageConf = require('../../package.json')
                res.json(packageConf)

            } catch (e) {
                console.log(e)
            }
        })

        this.router.get('/bots', async (req, res) => {
            try {
                let bots = await axios.get('https://api.dogegarden.net/v1/bots?dogestats')
                res.json(bots.data);
            } catch (e) {
                console.log(e)
            }
        })

        this.router.get('/mysql', async (req, res) => {
            // console.log(req.query.time)
            let validQueries = ['24h', 'week', 'month', 'alltime', 'custom'];
            if (validQueries.indexOf(req.query.time) != -1) {

                try {
                    let data = await Stats.getData(req.query.time);
                    // console.log(data)
                    res.json(data);
                } catch (e) {
                    console.log(e);
                    res.status(500).json({ error: e });
                }
            }

        })

        return this.router
    }
}

module.exports = API;
