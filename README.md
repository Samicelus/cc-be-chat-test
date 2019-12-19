# Chat system from samicelus


# configuration

- server configuration

```
//config/serverconfig.json
{
    "host":"127.0.0.1",       //client will connect server in this host 
    "port":"3021"             //server websocket port
}
```

- enumerable commands

```
//constants/commands.json
[
    "popular",
    "stats"
]
```

- enumerable message types

```
//constants/messageTypes.json
[
    "regist",
    "chat",
    "whisper",      //todo
    "command"
]
```

# start server

```
$node server
```

# start client

```
$node client
```

# server structure

[![](https://github.com/Samicelus/cc-be-chat-test/blob/master/src/websocketServer.png)](https://github.com/Samicelus/cc-be-chat-test/blob/master/src/websocketServer.png "websocketServer")


# client structure

[![](https://github.com/Samicelus/cc-be-chat-test/blob/master/src/client.png)](https://github.com/Samicelus/cc-be-chat-test/blob/master/src/client.png "websocketServer")


# profanity words filter

Abused words are filtered using DFA and trie.

Words list file is placed in ./lib/default/abuse/

Data structure implementation from:
[![](https://github.com/trekhleb/javascript-algorithms)

# NPM packages added

- lodash :  javascript util that makes array, object and string easier to operate.
- ws     :  websocket server and client implementation. 
- moment :  used in this project to format time string and calculate duration between two different time



