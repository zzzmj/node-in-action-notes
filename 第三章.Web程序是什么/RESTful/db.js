const sqlite3 = require('sqlite3').verbose()
const dbname = 'later.sqlite'
const db = new sqlite3.Database(dbname)

db.serialize(() => {
    const sql = `
        CREATE TABLE IF NOT EXISTS articles (
            id integer primary key, 
            title, 
            content TEXT
        )
    `
    db.run(sql)
})

class Article {
    // cb是callback的缩写
    static all(cb) {
        db.all('SELECT * FROM articles', cb)
    }

    static find(id, cb) {
        db.get('SELECT * FROM articles where id = ?', id, cb)
    }

    static create(data, cb) {
        const sql = 'INSERT INTO articles(title, content) values(?, ?)'
        db.run(sql, data.title, data.content, cb)
    }

    static delete(id, cb) {
        if (!id) return cb(new Error('pleast provider an id'))
        db.run('DELETE FROM articles WHERE id = ?', id, cb)
    }
}

module.exports = db
module.exports.Article = Article