// 一个小例子. 
const http = require('http')
const fs = require('fs')

const getTitles = (res) => {
    fs.readFile(__dirname + '\\titles.json', (err, data) => {
        if (err) return hadError(err, res)
        getTemplate(JSON.parse(data.toString()), res)
    })
}

const getTemplate = (titles, res) => {
    fs.readFile(__dirname + '\\template.html', (err, data) => {
        if (err) return hadError(err, res)
        formatHTML(titles, data.toString(), res)
    })
}

const formatHTML = (titles, tmpl, res) => {
    const html = tmpl.replace('%', titles.join('</li><li>'))
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(html)
}

const hadError = (err, res) => {
    console.error(err)
    res.end('Server Error')
}

http.createServer((req, res) => {
    if (req.url = '/') {
        getTitles(res)
    }
}).listen(8080, '127.0.0.1')

