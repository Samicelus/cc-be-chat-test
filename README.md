# Chat system from samicelus


# configuration

```
//config/serverconfig.json
{
    "host":"127.0.0.1",       //client will connect server in this host 
    "port":"3021"             //server websocket port
}
```

# start server

```
$node server
```

# start client

```
$node client
```

# server system

```flow
st=>start: 用户登陆
op=>operation: 登陆操作
cond=>condition: 登陆成功 Yes or No?
e=>end: 进入后台

st->op->cond
cond(yes)->e
cond(no)->op
```


websocketServer                 //emit "ping" to client side to keep it alive, receive "pong" 
    |
    ├─── userService         
    |   |
    |   ├───── regist           // regist name in ws.socketid, broadcast join msg, record login time
    |   ├───── replyStats       // called from commandService.stats, calculate user stats
    |   ├───── toggleAlive      // periodically set user.isAlive to false(will set to true when pong)
    |   ├───── checkLeave       // periodically check if user leaved the room
    |   └───── leave            // broadcast leave msg
    ├─── messageService
    |   |
    |   ├───── saveMsg          // save the last 50 messages
    |   ├───── chat             // receive chat message from client and broadcast
    |   |       └─── abuse      // profanity word filter using trie and FDA, see ./lib/abuse
    |   ├───── replyRecentMsg   // called from userService.regist, return the last 50 chat logs
    |   ├───── replyPopular     // called from commandService.popular, return the most popular word in recent 5s chat
    └─── commandService
        ├───── popular          // call messageService.replyPopular
        └───── stats            // call userService.replyStats, return user alive time


