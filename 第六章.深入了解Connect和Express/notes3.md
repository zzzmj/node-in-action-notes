#### 3.4 用户认证
这一节从头开始为程序创建一个认证系统，也就是登录注册
- 存储和认证已注册的用户
- 注册功能
- 登录功能
- 加载用户信息的中间件

##### 3.4.1 保存和加载用户记录

本节实现用户加载，保存和认证，有三步过程
1. 创建用户模型，用 Redis 创建和保存用户信息
2. 用 bcrypt 增强用户密码的安全性
3. 实现用户认证

bcrypt是一个加盐的哈希函数，对密码做哈希处理，提高用户安全性

这几步操作，书上写的着实有点难懂，一时间没有明白redis的逻辑。
**1. 创建用户模型，用 Redis 加载和保存用户信息**

我们想实现的功能就是 `new User({name: 'zmj'})`，会创建一个对象，然后对象的属性name会设为`zmj` 保存到redis中

```js
const redis = require('redis')
const db = redis.createClient()

class User {    
    constructor(obj) {
        // obj = {a: 1, b: 2, c: 3}
        // this[a] = 1, this[b] = 2, this[c] = 3
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
        if (this.id) {
            this.update(cb)
        } else {
            // 没有id就创建唯一 id
            // 这个操作是指定值的，记录有多少个用户
            db.incr('user:ids', (err, id) => {
                if (err) return cb(err)
                this.id = id
                update(cb)
            })
        }
    }

    update(cb) {
        const id = this.id
        db.set(`user:id:${this.name}`, id, (err) => {
            if (err) return cb(err)
            db.hmset(`user:${id}`, this, (err) => {
                cb(err)
            })
        })
    }
}

module.exports = User
```

redis因为我没有接触过，第一时间真把我看懵了，结合着可视化工具分析了一下才清楚了书上的逻辑

首先明白这一步操作
```js
db.incr('user:ids', callback)
```
这步操作是为了统计用户的数目的，不是用来存储用户的，incr命令是一个增量命令，在每次使用的时候都会加一

然后看懂update函数

我们创建用户的逻辑是这样的, 传进来一个用户对象`{name: 'zmj', ...}`
```js
// 我们根据用户名，来做键值
user:id:name
// 用user:ids做值，也就是用户的数目
```

我们做这一步的效果大概就是为了像下面那样的效果
```js
xxx是第1位用户
yyy是第2位用户
zzz是第3位用户
// 用户名就是我们的user:id:name, 数目就是user:ids
// 这样一来user:id:name还可以做索引
```

然后看懂最后一步
```js
db.hmset(`user:${id}`, this, (err) => {
    cb(err)
})
```

这一步是是存储用户信息，得到的效果大概如下
```js
user:1 => 'name': 'zmj', 'pwd': '123',
user:2 => 'name': 'zmj', 'pwd': '123',
user:3 => 'name': 'zmj', 'pwd': '123',
```

总言之上述逻辑最后得到的数据库应该是这样的

- user
    - ids       # 记录用户数量， string
    - id:name   # 记录用户名，做索引，string
    - id        # 记录用户信息， hash

因此查用户的时候 我们只需要
```js
// 通过id索引，用户信息是hash存储的，所以可以拿响应的属性
user:id:name
```

这一步完成后，自己测试一下能不能创建成功，建议还是使用可视化工具=。=


接下来实现一下查用户数据的功能, 验证的功能

```js
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
}
```

这两步都比较简单

##### 3.4.2 登录注册功能

先实现注册功能

模板部分
```html
<form action="/register" method="post">
    <p>
        <input type="text" name="user[name]" placeholder="username" />
    </p>
    <p>
        <input type="password" name="user[pwd]" placeholder="password" />
    </p>
    <p>
        <input type="submit" value="Post">
    </p>
</form>
```

路由部分
```js
exports.form = (req, res, next) => {
    res.render('register', {title: 'register'})
}

exports.submit = (req, res, next) => {
    const user = req.body.user
    console.log(user)
    res.redirect('/')
}

// app.js下
app.get('/register', register.form)
app.post('/register', register.submit)
```

套路其实都差不多。

