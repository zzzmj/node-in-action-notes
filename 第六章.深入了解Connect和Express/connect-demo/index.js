const app = require('connect')()

const logger = (format) => {
    const regexp = /:(\w+)/g
    return (req, res, next) => {
        const str = format.replace(regexp, (match, property) => {
            return req[property]
        })
        console.log(str)
        next()
    }
}

app.use(logger(":method :url"))
app.use((req, res, next) => {
    res.end('hello, world')
})

app.listen(3000)