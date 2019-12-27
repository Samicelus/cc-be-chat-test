const WebSocket = require('ws');
const serverConfig = require('./config/serverConfig.json');
const wss = new WebSocket.Server({ port: serverConfig.port });

const events = require('events');
class EventHandler extends events{}
const eventHandler = new EventHandler();

wss.userService = require('./services/userService');
wss.userService.setWss(wss);
wss.userService.setEvents(eventHandler);
wss.messageService = require('./services/messageService');
wss.messageService.setWss(wss);
wss.messageService.setEvents(eventHandler);
wss.commandService = require('./services/commandService');
wss.commandService.setWss(wss);
wss.commandService.setEvents(eventHandler);

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    try{
        let {user, type, content} = JSON.parse(data);
        switch(type){
            case "regist":
                wss.userService.regist(content, ws);
                break;
            case "chat":
                wss.messageService.chat(user, content);
                break;
            case "command":
                wss.commandService.execommand(ws, content);
                break;
            default:
                console.error(`Unknown message type: ${type}!`);
                break;
        }
    }catch(e){
        console.error(e);
    }
  });

  ws.isAlive = true;
  ws.on('pong', function heartbeat(){
      ws.isAlive = true;
      if(wss.userService.users[ws.socketid]){
        wss.userService.users[ws.socketid].isAlive = true;
      }
  });
});

setInterval(function ping() {
    wss.userService.checkLeave();
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) {
            return wss.userService.disconnect(ws);
        }
        ws.isAlive = false;
        ws.ping();
    });
    wss.userService.toggleAlive();
}, 1000);

console.log(`server start at port: ${serverConfig.port}`);

module.exports = wss;
