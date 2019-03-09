const EventEmitter = require('events').EventEmitter

const channel = new EventEmitter()
channel.on('join', () => {
    console.log('welcome!')
})

channel.emit('join')
channel.emit('join')
channel.emit('呵呵')
channel.emit('join')