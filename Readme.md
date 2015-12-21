# BLOG 
使用 express + Mongodb 搭建

# Nodejs 学习笔记

## ejs 语法

ejs 三种标签

* <% code %>:javascript 代码
* <%=code %>: 显示替换过的html特殊字符
* <%- code %>: 显示原始的html 内容

##路由规则

**req.query**

> // GET /search?q=tobi+ferret  
req.query.q  
// => "tobi ferret"  

> // GET /shoes?order=desc&shoe[color]=blue&shoe[type]=converse  
req.query.order  
// => "desc"  

> req.query.shoe.color  
// => "blue"  

req.query.shoe.type  
// => "converse" 

**req.body**

> // POST user[name]=tobi&user[email]=tobi@learnboost.com  
req.body.user.name  
// => "tobi"  

> req.body.user.email  
// => "tobi@learnboost.com"  

> // POST { "name": "tobi" }  
req.body.name  
// => "tobi"  

** req.params**

> // GET /user/tj  
req.params.name  
// => "tj"  

> // GET /file/javascripts/jquery.js  
req.params[0]  
// => "javascripts/jquery.js"

** req.param(name) **

>// ?name=tobi  
req.param('name')  
// => "tobi"  

>// POST name=tobi  
req.param('name')  
// => "tobi"  

>// /user/tobi for /user/:name   
req.param('name')  
// => "tobi" 

## supervisor的作用

每次代码更新需要重启，有了这个模块就不用重新启动，**更改代码就会生效**

> npm install -g supervisor

安装过后的启动命令是

> supervisor app.js

遇到一个错误

> Supervisor node .js “Program node app exited with code 0” error

因为app.listen 不在 app.js内部，这种情况有可能在/bin/www中，所以要使用 supervisor ./bin/www

## 页面通知

使用flash把一些错误或者成功信息传递到页面，他是session中的一个存储区域。[(https://github.com/jaredhanson/connect-flash)](https://github.com/jaredhanson/connect-flash)

***

## 会话

> 会话是一种持久的网络协议，用于完成服务器和客户端之间的一些交互行为。会话是一个比连接粒度更大的概念， 一次会话可能包含多次连接，每次连接都被认为是会话的一次操作。在网络应用开发中，有必要实现会话以帮助用户交互。例如网上购物的场景，用户浏览了多个页面，购买了一些物品，这些请求在多次连接中完成。许多应用层网络协议都是由会话支持的，如 FTP、Telnet 等，而 HTTP 协议是无状态的，本身不支持会话，因此在没有额外手段的帮助下，前面场景中服务器不知道用户购买了什么。

> 为了在无状态的 HTTP 协议之上实现会话，Cookie 诞生了。Cookie 是一些存储在客户端的信息，每次连接的时候由浏览器向服务器递交，服务器也向浏览器发起存储 Cookie 的请求，依靠这样的手段服务器可以识别客户端。我们通常意义上的 HTTP 会话功能就是这样实现的。具体来说，浏览器首次向服务器发起请求时，服务器生成一个唯一标识符并发送给客户端浏览器，浏览器将这个唯一标识符存储在 Cookie 中，以后每次再发起请求，客户端浏览器都会向服务器传送这个唯一标识符，服务器通过这个唯一标识符来识别用户。 对于开发者来说，我们无须关心浏览器端的存储，需要关注的仅仅是如何通过这个唯一标识符来识别用户。很多服务端脚本语言都有会话功能，如 PHP，把每个唯一标识符存储到文件中。

>——《Node.js开发指南》

## 中间件

> 例如index.js中的代码

>   `router.get('/logout',checkLogin);
   router.get('/logout', function (req, res) {
      req.flash('success', '登出成功！');
      req.session.user = null;
      res.redirect('/');
   });
   function checkLogin(req,res,next){
     if(!req.session.user){
       req.flash('error','用户未登录！');
       res.redirect('/login');
     }
     next();
   }`
   
> 启动程序的时候会顺序注册回调函数，当用户在此访问logout的页面，这个时候先回调用回调函数checklogin,如果没有next中间件，在user存在的情况下
就不会做flash用户未登录，以及跳转到login页面。 
 
## 注意的问题

* 错误
  > TypeError: Cannot set property 'user' of undefined
* 解决
  > app.use (session()) 要在 app.use('/',routes)前面
* app.use 和 app.get区别
> [参照stackoverflow上的解释](http://stackoverflow.com/questions/15601703/difference-between-app-use-and-app-get-in-express-js)
> 1. app.use()可以绑定中间件。并且app.use()可以处理各种请求
> 比如 GET/ POST PUT etc
> 2. app.get() 当有http请求的时候（get请求）只能处理传递过来的路径的get请求。

***

# MongoDb 学习

> 安装 MongoDB 很简单,去官网下载对应系统的 MongoDB 压缩包即可。解压后将文件夹重命名为 mongodb，并在 mongodb 文件夹里新建 blog 文件夹作为我们博客内容的存储目录。进入到 bin 目录下：运行：

> mongod --dbpath ../blog/
以上命令的意思是:设置 blog 文件夹作为我们工程的存储目录并启动数据库。

> use blog
> db.posts.find({})

查询所有的post数据

## MongoDb 操作

1. insert操作
> db.person.insert({'name':'jack','age':20})

2. find操作
> db.person.find({'name':'joe'})

3. update 操作
> db.person.update({'name':'joe'},{'name':'joe','age':25})
> db.person.update({'name':'joe'},{$set:{'age':25}})
> db.person.remove() 删除所有数据
4. mongodb 修改器($inc/$set/$unset/$push/$pop/upsert...)
  * 数组修改器 $push 示例操作效果如下：
> `> db.c.find()
{ "_id" : ObjectId("5003be465af21ff428dafbe7"), "name" : "toyota", "type" : "suv", 
"size" : { "height" : 8, "width" : 7, "length" : 15 } }`
 * 先push一个当前文档中不存在的键title
>`> db.c.update({"name" : "toyota"},{$push:{"title":"t1"}})`
> `> db.c.find()
{ "_id" : ObjectId("5003be465af21ff428dafbe7"), "name" : "toyota", "size" : { "height" : 8,
 "width" : 7, "length" : 15 }, "title" : [ "t1" ], "type" : "suv" }`
  * 再向title中push一个值
> `> db.c.update({"name" : "toyota"},{$push:{"title":"t2"}})`
> `> db.c.find()
{ "_id" : ObjectId("5003be465af21ff428dafbe7"), "name" : "toyota", "size" : { "height" : 8,
 "width" : 7, "length" : 15 }, "title" : [ "t1", "t2" ], "type" : "suv" }`
 
 * --再向title中push一个值
> `> db.c.update({"name" : "toyota"},{$push:{"title":"t2"}})`
> `> db.c.find()
{ "_id" : ObjectId("5003be465af21ff428dafbe7"), "name" : "toyota", "size" : { "height" : 8,
 "width" : 7, "length" : 15 }, "title" : [ "t1", "t2", "t2" ], "type" : "suv" }`
 
 * --再向一个已经存在的键值非数组类型的键push一个值
> `> db.c.update({"name" : "toyota"},{$push:{"size.height":10}})
Cannot apply $push/$pushAll modifier to non-array`
> `> db.c.update({"name" : "toyota"},{$push:{"name":"ddddddd"}})
Cannot apply $push/$pushAll modifier to non-array`
 
 > 得出结论：$push--向文档的某个数组类型的键添加一个数组元素，不过滤重复的数据。添加时键存在，要求键值类型必须是数组；键不存在，则创建数组类型的键。
 
 4.sort() 方法排序 ｛a:1｝以a升序排列 -1 降序排列
***
setting for VS Code
***
`{
	"version": "0.1.0",
	// List of configurations. Add new configurations or edit existing ones.
	// ONLY "node" and "mono" are supported, change "type" to switch.
	"configurations": [
		{
			// Name of configuration; appears in the launch configuration drop down menu.
			"name": "supervisor app.js",
			// Type of configuration. Possible values: "node", "mono".
			"type": "node",
			// Workspace relative or absolute path to the program.
			"program": "./bin/www",
			// Automatically stop program after launch.
			"stopOnEntry": false,
			// Command line arguments passed to the program.
			"args": [],
			// Workspace relative or absolute path to the working directory of the program being debugged. Default is the current workspace.
			"cwd": ".",
			// Workspace relative or absolute path to the runtime executable to be used. Default is the runtime executable on the PATH.
			"runtimeExecutable": null,
			// Optional arguments passed to the runtime executable.
			"runtimeArgs": ["--nolazy"],
			// Environment variables passed to the program.
			"env": { },
			// Use JavaScript source maps (if they exist).
			"sourceMaps": false,
			// If JavaScript source maps are enabled, the generated code is expected in this directory.
			"outDir": null
		},
		{
			"name": "Attach",
			"type": "node",
			// TCP/IP address. Default is "localhost".
			"address": "localhost",
			// Port to attach to.
			"port": 5858,
			"sourceMaps": false
		}
	]
}`





