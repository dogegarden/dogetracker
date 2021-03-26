const monk = require('monk');
const Logger = require('../util/Logger')
require('dotenv').config()
const db = monk(process.env.MONGO_URL);
Logger.mongo('Connected to mongodb.')

class Calls {
    static async getUser(id) {
        const collection = db.get('users')
        return (await collection.findOne({ user_id: id }))
    }

    static async addRoom(room) {
        const collection = db.get('rooms')
        return (await collection.insert({ 
            room_id: room.id, 
            room_name: room.name 
        }))
    }

    static async getRoom(id) {
        const collection = db.get('rooms')
        return (await collection.findOne({ 
            room_id: room.id,
        }))
    }

    

    // static async addUsersToRoom(room_id, users) {
        // const collection = db.get('rooms')
        // return (await collection.findOne({ 
        //     room_id: room.id,
        // }))
    // }
}

module.exports = Calls;