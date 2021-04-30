const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const path = require('path')
const Router = require('./Router');
const Logger = require('../util/Logger')
const fs = require('fs').promises;
const axios = require('axios')
require('dotenv').config()


class App {
    server;
    constructor() {
        this.app = express()
        this.server = require('http').createServer(this.app)
        this.app.engine('e', require('ejs').renderFile)
        this.app.set('view engine', 'ejs')
        this.app.set('views', path.join(__dirname, '..', 'views'))
        this.app.use(cors({
            origin: "*"
        }));
        this.app.use('/public', express.static(path.join(__dirname, '..', 'public')));
        this.app.use(cookieParser());
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
    }
    /**
     * @param {express.Request} req
     * @param {express.Response} res
     * @param {function()} next
     */

    async registerRoutes() {

        const filePath = path.join(__dirname, '..', 'routes');
        const files = await fs.readdir(filePath);
        for await (const file of files) {
            if (file.endsWith('.js')) {
                const router = require(path.join(filePath, file));
                if (router.prototype instanceof Router) {
                    const instance = new router(this);
                    Logger.route(`Route File ${instance.path} running.`);
                    if (instance.auth) {
                        this.app.use(instance.path, this.Authentication, instance.createRoute());
                    } else {
                        this.app.use(instance.path, instance.createRoute());
                    }
                }
            }
        }

        // routes below...

        let packageConf = require('../../package.json')

        this.app.get('/', function (req, res) {
            res.render('index.ejs', {
                path: req.path,
                version: packageConf.version
            })
        })

        // this.app.get('/bots', function(req, res) {
        //     res.render('bots.ejs', {
        //         path: req.path,
        //     })
        // })

        this.app.get('/rooms', async function (req, res) {
            try {
                const rooms = await axios.get('https://api.dogegarden.net/v1/popularRooms');
                console.log(rooms.data.rooms.rooms)
                res.render('rooms.ejs', {
                    path: req.path,
                    rooms: rooms.data.rooms.rooms
                })
            } catch (err) {
                console.log(err)
            }
        })

        // this.app.get('/scheduled', async function(req, res) {
        //     try {
        //         const rooms = await axios.get('https://api.dogegarden.net/v1/scheduledRooms');
        //         console.log(rooms.data.rooms)
        //         res.render('scheduled.ejs', {
        //             path: req.path,
        //             rooms: rooms.data.rooms
        //         })
        // } catch(err) {
        //     console.log(err)
        // }
        // })

        // this.app.get('/statistics', async function(req, res) {
        //     res.render('statistics.ejs', {
        //         path: req.path
        //     })
        // })

        // this.app.get('/bots', function(req, res) {
        //     res.render('bots.ejs', {
        //         path: req.path,
        //     })
        // })

    } // end listener



    async listen(fn) {
        this.server.listen(process.env.EXPRESS_PORT, fn);
    }

}

module.exports = App;