const express = require('express')
const app = express()
const Article = require('./db').Article
const bodyParser = require('body-parser')
const read = require('node-readability')


app.set('port', 3000)

app.use(bodyParser.json()) // 1. 支持编码为JSON的请求消息体
app.use(bodyParser.urlencoded({ extended: true })) // 2. 支持编码为表单的请求消息体


/**
 * 获取所有的文章
 */
app.get('/articles', (req, res, next) => {
    Article.all((err, articles) => {
        if (err) return next(err)
        res.format({
            html: () => {
                res.render('articles.ejs', { articles })
            },
            json: () => {
                res.send(articles)
            }
        })
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
 * 爬取一篇文章
 */
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

