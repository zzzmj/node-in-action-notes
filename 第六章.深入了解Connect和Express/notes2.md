## 3. Express

Express是在connect基础上搭建的, 先安装express的脚手架
```bash
npm install -g express-generator
```

使用ejs模板引擎
```bash
express -e express-project
```

### 3.1 留言版项目规划

功能需求
1. 用户可以注册，登录，退出
2. 用户可以发消息
3. 访问者可以分页浏览条目
4. 有一个简单的REST API

路由设计

- API路由
    - GET /api/entries: 获取消息列表
    - GET /api/entries/page: 获取单页条目
    - POST /api/entry: 创建新的留言条目
- Web UI路由
    - GET /post: 显示消息表单
    - POST /post: 提交消息表单
    - get /register: 显示注册表单
    - post /register: 创建新用户
    - get /login: 显示登录表单
    - post /login: 登录
    - get /logout: 退出

### 3.2 渲染视图

Express几乎支持所有的模板引擎，本项目使用ejs

Express有两种渲染视图的方法：
1. app.render() 在程序层使用
2. res.render() 在请求或者响应层使用

本项目只会使用`res.render()`

#### 3.2.1 了解渲染机制

主要介绍三方面
1. 调整视图的查找
2. 配置默认的模板引擎
3. 启用视图缓存，减少文件I/O

**首先是设置 views， 给程序指明渲染视图的路径**
```js
app.set('views', __dirname + '/views')
```
ps: `__dirname`表示当前文件的目录

**然后指定渲染引擎**
```js
app.set('view engine', 'ejs');
```

**视图缓存**
视图缓存`view cache`是默认开启的，
如果不开视图缓存， 每次渲染
```js
rers.render('user', {name: 'zmj'})
```
都会从硬盘中读取html

如果开启的，读取了一次html后，会缓存好，下次再读取的时候直接读取缓存，而不用再去磁盘上读了



#### 3.2.2 将数据传给视图
1. res.render()
2. res.locals
3. app.locals


### 3.3 express路由入门
这一节要做留言版的两个功能
1. 用特定路由的中间件校验用户提交的内容
2. 实现特定路由的校验

为了实现校验，给这个程序加上消息提交的功能（用户不提交消息，你咋校验=。=）

#### 3.3.1 消息提交功能
消息提交功能要完成以下几点
- 创建消息模型
- 添加与消息相关的路由
- 创建消息表单
- 添加业务逻辑

##### 3.3.2 创建消息模型
表示没有接触过redis，=。=，硬着头皮来吧。

这里使用到了redis，安装指南
去github上下win10版本 https://github.com/MicrosoftArchive/redis/releases
下载msi的

省事，会自动帮你配好服务和环境
在cmd中测试一下
```bash
redis-cli.exe -h 127.0.0.1 -p 6379 
设置键值对 set myKey abc
取出键值对 get myKey
```

这里我们安装好了redis服务器后，再去项目里安装redis模块
```bash
npm install --save redis
```


redis的文档 [readme](https://github.com/NodeRedis/node_redis)
中文命令手册[命令](http://doc.redisfans.com/index.html)
官网的api [api](https://redis.io/commands)

redis支持很多数据结构，基本常见的都支持这里使用到了列表

创建`models/entry.js`
```js
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
```

lpush是redis像列表中插入数据的方法，第一个参数是键名，第二个是值，第三个是回调

lrange是查询数据的方法，第一个参数是键名，第二和第三个是起始位置和结束位置，第四个是回调


##### 3.3.3 添加与消息相关的路由

创建模板文件`post.ejs`

```html
<form action="/post" method="post">
    <p>
        <input type="text" name="entry[title]" placeholder="Title" />
    </p>
    <p>
        <input type="text" name="entry[body]" placeholder="Body" />
    </p>
    <p>
        <input type="submit" value="Post">
    </p>
</form>
```

然后建立路由
```js
app.get('/post', entries.form)
app.post('/post', entries.submit)

/* 下面是routes/entries文件 */
// GET '/post'
exports.form = (req, res, next) => {
    res.render('post', { title: 'post' });
}
  
// POST '/post'
exports.submit = (req, res, next) => {
    console.log(req.body.entry)
    res.redirect('/')
    // res.render('post', { title: 'post' });
}
```
还要注意的地方，得打开bodyParse解析
```js
app.use(express.urlencoded({ extended: true }));
```


将消息存入数据库中
```js
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
```

显示所有消息
```js
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
```


##### 3.3.4 校验表单

说起校验表单，你可能第一种想的方式是在这里面完成
```js
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
```

这种方式扩展性不好，我们使用特定的中间件来实现校验, 我们创建一个中间件`middleware/validate.js`
```js
const parseField = (field) => {
    // 将 entry[filed] 解析为 ['entry', 'filed']
    return field.split(/\[|\]/g).filter((s) => s)
}

const getField = (req, field) => {
    // 这个骚操作，我醉了！ 首先val = req.body， 然后val = val[entry], 然后val = entry.filed
    let val = req.body
    field.forEach((prop) => {
        val = val[prop]
    })
    return val
}

exports.required = (field) => {
    field = parseField(field)
    return (req, res, next) => {
        if (getField(req, field)) {
            next()
        } else {
            res.render('error，你必须输入标题')
            res.redirect('back')
        }
    }
}

exports.lengthAbove = (field, len) => {
    field = parseField(field)
    return (req, res, next) => {
        if (getField(req, field).length > len) {
            next()
        } else {
            res.render(`error，你内容必须超过${len}个长度`)
            res.redirect('back')
        }
    }
}
```

这段代码理解起来有难度，但这很方便我们使用中间件，以及添加各种验证方式

使用验证表单的中间件
```js
app.post('/post', validate.required('entry[title]'), validate.lengthAbove('entry[body]', 5), entries.submit)
```

我们只需要，将表单字段传过来即可验证，是不是很方便，扩展性也相当好！


## 该节总结

这一段实现了留言版的功能，使用redis当数据库

可以留言，对留言进行了简单的校验

这一节做了三个路由
- GET /post: 显示消息表单
- POST /post: 提交消息表单
- GET /list: 获取消息列表

总言之，学到了不少东西。
很多东西都是书上没写需要自己去手动查资料的，像express的一些api，redis的使用等等
