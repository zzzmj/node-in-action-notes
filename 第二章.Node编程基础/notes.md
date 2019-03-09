## 1. 用回调处理一次性事件

做一个简单的HTTP服务器, 实现几个功能
1. 异步获取JSON中的数据
2. 异步获取HTML模板
3. 将JSON中的数据导入HTML模板中
4. 将HTML网页显示在浏览器上

```js
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
```

## 2. 用事件发射器(EventEmitter)处理重复性事件

事件发射器会触发事件, 并且在那些事件被触发时能处理它们.
比如HTTP服务器, TCP服务器和流. 都被做成了事件发射器

事件是通过监听器进行处理的.
**监听器是与事件相关联, 每当有事件出现时, 就会被触发的回调函数**
例如Node中 TCP socket, 它有一个data事件, 每当socket有新数据的时候就会触发
```js
socket.on('data', handleData)
```
### 2.1 示例. 用on方法响应事件
```js
const net = require('net')
const server = net.createServer((socket) => {
    socket.on('data', data => {
        console.log(data.toString())
        socket.write(data)
    })
})

server.listen(8888)
```

### 2.2 创建事件发射器
EventEmitter是一个事件发射器
我们可以通过EventEmitter的实例
1. 注册监听器
   ```js
   eventEmitter.on()
   ```
2. 触发事件
    ```js
    eventEmitter.emit()
    ```
因此, 写出一个小demo
```js
const EventEmitter = require('events').EventEmitter

const channel = new EventEmitter()
channel.on('join', () => { // 注册监听, 监听join事件, 事件被触发后调用后面的函数
    console.log('welcome!')
})

channel.emit('join') // 发射事件
```

注: **事件名称可以是任意字符串. 只有error事件是特殊的**

### 2.3 使用事件发射器实现简单的`发布/订阅`系统(聊天室)

```js
const events = require('events')
const net = require('net')

const channel = new events.EventEmitter()
channel.clients = {}
channel.subscriptions = {}
channel.on('join', function(id, client) {
    console.log(`监听到${id}号玩家加入游戏`)
    this.clients[id] = client
    this.subscriptions[id] = (senderId, msg) => {
        if (id != senderId) {
            this.clients[id].write(msg)
            console.log(`${id}号玩家收到广播消息${msg}`)
        }
    }
    this.on('boardcast', this.subscriptions[id])
})

let id = 0
const server = net.createServer((client) => {
    const gamer = ++id
    console.log(`玩家${gamer}进入服务器`)
    channel.emit('join', gamer, client)
    client.on('data', (data) => {
        console.log(`${gamer}玩家发送广播消息: ${data.toString()} .`)
        channel.emit('boardcast', gamer, data.toString())
    })
})

server.listen(8888)
```
上面一版的代码会出现问题, 因为我们给每个用户都绑定了监听器, 当用户退出的时候, 监听器没有关闭, 就会出现错误

所以我们要在用户退出的时候, 删去与之对应的监听器
```js
// ...
channel.on('leave', function(id) {
    console.log(`${id}号用户已经退出房间`)
    channel.removeListener('broadcast', this.subscriptions[id])
})

// ...
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
```


