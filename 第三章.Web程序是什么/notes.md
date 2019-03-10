## 1. 了解Web程序的结构
- package.json 包
- public/  静态资源文件夹，CSS和JS都放这里
- node_modules/ 依赖
- 放程序代码的
  - app.js或者index.js 程序入口
  - models/ 数据库模型
  - views/ 渲染页面模板
  - controllers/或者routes/ HTTP请求处理器
  - middleware/ 中间件

## 2. 搭建一个RESTful web服务

这个概念我有点模糊
查了一下[RESTful Web 服务 - 介绍](http://wiki.jikexueyuan.com/project/restful/introduction.html)
REST是一种软件架构模式
| HTPP方法  | 作用  |
|---|---|
| GET  | 提供资源的只读访问  |
| PUT  | 创建一个资源  |
| DELETE  | 删除一个资源  |
| POST  | 更新或删除一个资源  |
| OPTIONS  | 获取资源操作  |


在 REST 架构中，一个 REST 服务器只提供对资源的访问，REST 客户端访问并呈现资源。
说白来就是服务器只负责增删改查，提供资源给前端

RESTful服务设计。 四个路由(都是HTTP方法)
- POST /articles 创建新文章
- GET /articles/:id 获取指定文章
- GET /articles 获取所有文章
- DELETE /articles/:id 删除指定文章

在考虑数据库和界面之前， 先设计路由比较好
[express文档](http://www.expressjs.com.cn/4x/api.html)
### 2.1 路由设计
```js
const express = require('express')
const app = express()
const articles = [
    {
        title: 'example'
    }
]

app.set('port', 3000)

/**
 * 1. 获取所有的文章
 */
app.get('/articles', (req, res, next) => {
    res.send(articles)
})

/**
 * 2. 创建一篇文章
 */
app.post('/articles', (req, res, next) => {
    res.send('OK')
})

/**
 * 3. 获取指定的文章
 */
app.get('/articles/:id', (req, res, next) => {
    const id = req.params.id
    console.log('fetching:', id)
    res.send(articles[id])
})

/**
 * 4. 删除指定的文章
 */
app.delete('/articles/:id', (req, res, next) => {
    const id = req.params.id
    console.log('fetching:', id)
    delete articles[id]
    res.send({ message: 'deleted' })
})

app.listen(app.get('port'), () => {
    console.log('App started on port', app.get('port'))
})
```

1. express能自动的将数组转为json响应
2. req.params是一个对象，能获取路由的路径
```js
// 比如说 设置了路线GET /user/:name
// 那么name属性可以作为req.params.name

// GET /user/tj
req.params.name
// => "tj"
```

由于chrome浏览器发送`delete`方法相当麻烦， 于是我用了一个插件`PostMan`，可以模拟各种HTTP请求。很方便






### 2.2 添加消息体(body)解析器
在上例的代码中， post方法用不了，因为处理post请求需要`消息体解析`

因为post请求，是给服务器这边发过来数据，发送数据可能有各种格式， 如果自己来写的话会很麻烦，所以导入中间件帮我们做这件事

了解一下post提交数据的方式
1. **application/x-www-form-urlencoded（默认常用的）**
默认表单提交就是这种方式

2. multipart/form-data
一般是上传文件

3. application/json
这种将数据以json格式提交，很赞=。=

4. text/xml
没用过，不做评价。

Express没有内置，于是要下载中间件`body-parser`(受官方支持)

在上例的基础上加代码
```js
const bodyParser = require('body-parser')

app.use(bodyParser.json()) // 1. 支持编码为JSON的请求消息体
app.use(bodyParser.urlencoded({ extended: true })) // 2. 支持编码为表单的请求消息体，也就是默认表单的形式

app.post('/articles', (req, res, next) => {
    const article = { 
        title: req.body.title,
        content: req.body.content
    }
    articles.push(article)
    res.send(articles)
})
```

这个中间件会帮我们把post请求的数据处理好，挂载在`req.body`下。


### 2.3 添加数据库
在Node中添加数据库，一般会涉及以下几个步骤

1. 选择想用的数据库（好像说了废话，2333）
2. 在 npm 上看 哪些实现了 ORM 的热门模块
3. 添加到项目中
4. 创建模型，封装数据库访问API
5. 将模型添加到Express路由中

ORM是啥？ 百度了一下。
[ORM的意思](https://blog.csdn.net/qq_27093465/article/details/52896288)
ORM:(Object/Relation Mapping): 对象/关系映射
ORM就是将编程语言里的**对象**和数据库中的**表**建立关系

这里选择使用SQLite， 原因是因为这个数据库不需要安装，是进程内数据库，开箱即用。

#### 2.3.1 制作自己的模型API

文章应该能被增删改查，模型类Article应该提供以下方法
- Article.all() 返回所有文章
- Article.find(id) 返回指定ID的文章
- Article.create(article) 创建文章
- Article.delete(id) 删除文章

Demo
```js
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
        db.get('select * from articles where id = ?', id, cb)
    }

    static create(data, cb) {
        const sql = 'insert into articles(title, content) values(?, ?)'
        db.run(sql, data.title, data.content, cb)
    }

    static delete(id, cb) {
        if (!id) return cb(new Error('pleast provider an id'))
        db.run('delete from articles where id = ?', id, cb)
    }
}

module.exports = db
module.exports.Article = Article
```


关于sql语句， 有些忘了， 查资料[SQL语法](http://wiki.jikexueyuan.com/project/sql/create-table.html)

还有sqlite的用法 [sqliteAPI](https://github.com/mapbox/node-sqlite3/wiki/API#databasegetsql-param--callback)

##### db.run(sql, [param,...], cb)
对于`db.run(sql, [param,...], cb)`
执行SQL语句， 不会检索结果。 如果执行失败了，就会调用回调函数。

##### db.get(sql, [param,...], cb)
执行SQL查询， 将第一个结果回调, 注意回调有两个参数， 第一个是error， 第二个才是结果

##### db.all(sql, [param,...], cb)
执行SQL查询， 将所有的结果回调
下了一款sqlite的工具，往表里插了几条数据，测试了一下都是正确的~~

#### 2.3.2 将数据库导入路由中

将db.js导入之前写的路由中
```js
const express = require('express')
const app = express()
const Article = require('./db').Article
const bodyParser = require('body-parser')

app.set('port', 3000)

app.use(bodyParser.json()) // 1. 支持编码为JSON的请求消息体
app.use(bodyParser.urlencoded({ extended: true })) // 2. 支持编码为表单的请求消息体


/**
 * 获取所有的文章
 */
app.get('/articles', (req, res, next) => {
    Article.all((err, articles) => {
        if (err) return next(err)
        res.send(articles)
    })
})

/**
 * 创建一篇文章
 */
app.post('/articles', (req, res, next) => {
    const article = { 
        title: req.body.title,
        content: req.body.content
    }
    Article.create(article, (err) => {
        return next(err)
    })
    res.send('create OK')
})

/**
 * 获取指定的文章
 */
app.get('/articles/:id', (req, res, next) => {
    const id = req.params.id
    Article.find(id, (err, article) => {
        if(err) return next(err)
        res.send(article)
    })
})

/**
 * 删除指定的文章
 */
app.delete('/articles/:id', (req, res, next) => {
    const id = req.params.id
    Article.delete(id, (err) => {
        return next(err)
    })
    res.send({ message: 'deleted' })
})

app.listen(app.get('port'), () => {
    console.log('App started on port', app.get('port'))
})
```

增删改查的功能的实现好了

#### 2.3.3 用爬虫爬取文章存入数据库中
文章肯定我们不想一个一个慢慢创建，我们可以用`readability`之类的模块，自动帮我们从网页中提取文章

这里书上用了`readability`

```bash
yarn add node-readability
```

```js
const read = require('node-readability')

app.post('/download/articles', (req, res, next) => {
    const url = req.body.url
    read(url, (err, result) => {
        if (err || !result) {
            res.status(500).send('Errror downloading article')
        }
        const article = { 
            title: result.title,
            content: result.content
        }
        Article.create(article, (err) => {
            return next(err)
        })
        res.send('create OK')
    })
})
```

使用这个库里的read()方法, 传入需要爬取的文章地址。

在回调函数中能获取能该网页
```js
const article = { 
    title: result.title,
    content: result.content // 这个得到的是内容的html
}
```

#### 2.3.5 渲染模板

拿到html后， 我们可以通过模板引擎来渲染用户界面。

结合Express和EJS

首先创建模板文件，
1. 创建views/articles.ejs
```html
<html>
    <head>
        <title>Later</title>
    </head>
    <body>
        <div class="container">
            <ul>
                <% articles.forEach((article) => { %>
                <li>
                    <a href="/articles/<%= article.id %>">
                        <%= article.title %>
                    </a>
                    <div>
                        <%- article.content %>
                    </div>
                </li>
                <% }) %>
            </ul>
        </div>
    </body>
</html>
```

注意点
**<%= code %>会对code进行html转义**
**<%- code %>将不会进行转义**


2. 使用Express提供的 res.format 方法。
   
一般我们在用浏览器输入地址`http://localhost:3000/articles`后
浏览器发出get请求, 一般请求类型都是`text/html`

Express提供的 res.format 方法，它可以根据请求发送响应格式的响应。

于是写代码
```js
app.get('/articles', (req, res, next) => {
    Article.all((err, articles) => {
        if (err) return next(err)
        res.format({
            html: () => {
                res.render('articles.ejs', { articles }) // 会自动去views/articles.ejs查找
            },
            json: () => {
                res.send(articles)
            }
        })
    })
})
```


## 3. 总结

使用express可以很快的搭出应用，但是在其中我们需要用挺多中间件的

像这个项目就用到了三个

```js
"body-parser": "^1.18.3",
"ejs": "^2.6.1",
"node-readability": "^3.0.0",
```
body-parser 在客户端post请求给服务器发送数据的时候， 这个中间件可以替我们解析各种请求方式的数据。简化操作
ejs 是模板引擎，用于渲染
node-readability 是用来下载文章的，随便给它一个网页，它能解析出文章内容，有点类似爬虫

这算是一个MVC的小项目了
使用express作为控制器（Controller）这一层， 负责转发请求，处理请求
使用ejs作为视图层（Views）渲染页面
使用sqlite作为模型层（Model）数据库存储数据



