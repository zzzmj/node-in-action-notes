读NodeJS实战一书的笔记

本笔记并没有事无巨细，一些我比较清楚的知识点，笔记中直接跳过了，或者会一笔带过。

个人觉得这份笔记还是很详细的。毕竟我很菜=。=


## 第二章. Node编程基础
[跳转至整章笔记处](https://github.com/zzzmj/node-in-action-notes/blob/master/%E7%AC%AC%E4%BA%8C%E7%AB%A0.Node%E7%BC%96%E7%A8%8B%E5%9F%BA%E7%A1%80/notes.md)
### 1. 用回调处理一次性事件
做一个简单的HTTP服务器, 实现几个功能
1. 异步获取JSON中的数据
2. 异步获取HTML模板
3. 将JSON中的数据导入HTML模板中
4. 将HTML网页显示在浏览器上

[跳转至样例代码](https://github.com/zzzmj/node-in-action-notes/blob/master/%E7%AC%AC%E4%BA%8C%E7%AB%A0.Node%E7%BC%96%E7%A8%8B%E5%9F%BA%E7%A1%80/blog_recent/blog_recent.js)


### 2. 用事件发射器实现聊天室功能

聊天室，实现广播功能
[跳转至样例代码](https://github.com/zzzmj/node-in-action-notes/blob/master/%E7%AC%AC%E4%BA%8C%E7%AB%A0.Node%E7%BC%96%E7%A8%8B%E5%9F%BA%E7%A1%80/repeat_event/chatroom.js)


## 第三章. Web程序是什么？
[跳转至整章笔记处](https://github.com/zzzmj/node-in-action-notes/blob/master/%E7%AC%AC%E4%B8%89%E7%AB%A0.Web%E7%A8%8B%E5%BA%8F%E6%98%AF%E4%BB%80%E4%B9%88/notes.md)

这一章做了一个完整的案例，算是一个符合MVC的小项目了, 符合RESTful API的Web程序

1. 使用Express
2. 实现了增删改查
3. 数据库使用了SQLite（用这个是因为项目小）
4. EJS渲染模板

[跳转至web目录处](https://github.com/zzzmj/node-in-action-notes/tree/master/%E7%AC%AC%E4%B8%89%E7%AB%A0.Web%E7%A8%8B%E5%BA%8F%E6%98%AF%E4%BB%80%E4%B9%88/RESTful)


## 第六章.深入了解Connect和Express

跳过了两章无关紧要的

这一章内容比较多，分成了几份笔记

1. [connect工作原理]()
2. [express实现留言版功能]()
2. [express登录注册]()

这一章的项目比较复杂
1. 使用Express
2. 实现增删改查，用户登录注册，表单验证
3. 用户留言的增删改查
4. 数据库使用Redis

[项目]()