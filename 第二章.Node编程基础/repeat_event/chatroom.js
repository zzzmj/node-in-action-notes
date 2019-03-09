const events = require('events')
const net = require('net')

class Channel extends events.EventEmitter {
    constructor() {
        super()
        this.clients = {}
        this.subscriptions = {}
    }

    start() {
        this.on('join', function(id, client) {
            console.log(`监听到${id}号用户加入聊天室`)
            this.clients[id] = client
            this.subscriptions[id] = (senderId, msg) => {
                // 忽略发送广播消息的用户
                if (id != senderId) {
                    this.clients[id].write(msg)
                    console.log(`${id}号用户收到广播消息${msg}`)
                }
            }
            this.on('broadcast', this.subscriptions[id])
        })

        this.on('leave', function(id) {
            console.log(`${id}号用户已经退出房间`)
            channel.removeListener('broadcast', this.subscriptions[id])
        })
    }
}

const channel = new Channel()
channel.start()
let id = 0
const server = net.createServer((client) => {
    const user = ++id
    console.log(`用户${user}进入服务器`)
    channel.emit('join', user, client)
    client.on('data', (data) => {
        console.log(`${user}用户发送广播消息: ${data.toString()} .`)
        channel.emit('broadcast', user, data.toString())
    })
    client.on('close', () => {
        channel.emit('leave', user)
    })
})
server.listen(8888)
// telnet 127.0.0.1 8888