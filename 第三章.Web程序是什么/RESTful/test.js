const read = require('node-readability')

const url = 'http://blog.topspeedsnail.com/archives/4028'

read(url, (err, result) => {
    console.log(result.content)
    console.log(result.title)
})
