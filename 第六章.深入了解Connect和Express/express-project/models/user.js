const redis = require('redis')
const db = redis.createClient()

class User {
    static getByName(name, cb) {
        // user:id:name
        db.get(`user:id:${name}`, (err, id) => {
            db.hgetall(`user:${id}`, (err, user) => {
                if (err) return cb(err)
                cb(null, new User(user))
            })
        })
    }

    static getUser(id, cb) {
        console.log(id)
        db.hgetall(`user:${id}`, (err, data) => {
            if (err) cb(err)
            cb(null, data)
        })
    } 

    static authenticate(name, pwd, cb) {
        User.getByName(name, (err, user) => {
            if (err || !user.id) return cb(err)
            if (user.pwd != pwd) {
                return cb(null, user)
            } else {
                return cb(err)
            }
        })
    }

    constructor(obj) {
        // 相当于 this = obj
        for (let key in obj) {
            this[key] = obj[key]
        }
    }

    /**
     * 将用户保存到redis中
     * @param {err} cb 
     */
    save(cb) {
        // 如果传进来的用户对象有id
        console.log('save： ', this)
        if (this.id) {
            this.update(cb)
        } else {
            // 没有id就创建唯一 id
            // 这个操作是指定值的，记录有多少个用户
            db.incr('user:ids', (err, id) => {
                if (err) return cb(err)
                this.id = id
                this.update(cb)
            })
        }
    }

    update(cb) {
        const id = this.id
        console.log('id', id)
        db.set(`user:id:${this.name}`, id, (err) => {
            if (err) {
                console.log('set这步出错了')
                return cb(err)
            }
            db.hmset(`user:${id}`, this, (err) => {
                cb(err)
            })
        })
    }
}


module.exports = User