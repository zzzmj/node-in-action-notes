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
[跳转至整章笔记处]()

这一章做了一个完整的案例，算是一个符合MVC的小项目了
使用Express做了一个带有RESTful API的Web程序
功能实现了增删改查
数据库使用了SQLite（用这个是因为项目小）
使用了EJS渲染模板

[跳转至目录处]()