const User = require('../models/user')

exports.form = (req, res, next) => {
    res.render('register', {title: 'register'})
}

exports.submit = (req, res, next) => {
    const data = req.body.user
    console.log(data)
    User.getByName(data.name, (err, user) => {
        if (err) return next(err)
        if (user.id) {
            console.log('用户名已经存在')
            res.send('用户名已经被占用')
        } else {
            user = new User({
                name: data.name,
                pwd: data.pwd
            })
            user.save((err) => {
                if (err) {
                    return next(err)
                }
                console.log('保存数据成功')
            })
        }
    })
    console.log(user)
    res.redirect('/')
}

exports.list = (req, res, next) => {
    res.render()
}