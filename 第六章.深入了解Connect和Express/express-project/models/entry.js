const redis = require('redis')
const db = redis.createClient()

class Entry {
    static getRange(from, to, cb) {
        db.lrange('entries', from, to, (err, items) => {
            if (err) return cb(err)
            let entries = []
            items.forEach((item) => {
                entries.push(JSON.parse(item))
            })
            cb(null, entries)
        })
    }
    
    constructor(obj) {
        // obj = {a: 1, b: 2, c: 3}
        // this[a] = 1, this[b] = 2, this[c] = 3
        for (let key in obj) {
            this[key] = obj[key]
        }
    }

    save(cb) {
        // 将消息转化为字符串，保存到Redis列表中
        const entryJSON = JSON.stringify(this)
        db.lpush('entries', entryJSON, (err) => {
            if (err) return cb(err)
            cb()
        })
    }
}

module.exports = Entry