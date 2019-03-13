const Entry = require('../models/entry')
// GET '/post'
exports.form = (req, res, next) => {
    res.render('post', { title: 'post' });
}

// GET '/list'
exports.list = (req, res, next) => {
    Entry.getRange(0, -1, (err, entries) => {
        console.log(entries)
        res.render('entries', { 
            title: 'msg list',
            entries: entries
        })
    })
}
  
// POST '/post'
exports.submit = (req, res, next) => {
    const data = req.body.entry
    const entry = new Entry({
        username: 'zmj',
        title: data.title,
        body: data.body
    })
    entry.save((err) => {
        if (err) return next(err)
        res.redirect('/')
    })
}