const inquirer = require('inquirer');
const WebSocket = require('ws');
const serverConfig = require('./config/serverConfig.json');
const ws = new WebSocket(`ws://${serverConfig.host}${serverConfig.port?":"+serverConfig.port:""}`);

const events = require('events');
class EventHandler extends events{}
const eventHandler = new EventHandler();

const Messenger = require('./domains/wsMessenger');
const messenger = new Messenger("", ws, eventHandler);
const commands = require('./constants/commands.json');
let clientInfo = {
  state: "0"
};
const Processor = require('./domains/messageProcessor');
const processor = new Processor(clientInfo, messenger, eventHandler);

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', function(line){
  switch(clientInfo.state){
    case "0":
      break;
    case "1":
      const name = line.trim();
      clientInfo.state = "2";
      messenger.name = name;
      messenger.sendMsg("regist", name);
      break;
    case "2":
      console.log(`logging please wait...`);
      break;
    case "3":
      const content = line.trim();
      if(content.slice(0,1) == "/"){
        let commandLine = content.slice(1).split(" ");
        if(commands.includes(commandLine[0])){
          messenger.sendMsg("command", content.slice(1));
        }else{
          console.log(`Invalid command: ${commandLine[0]}`);
        }
      }else{
        messenger.sendMsg("chat", content);
      }
      break;
    default:
      break;
  }
})

ws.on('open', function open() {
  clientInfo.state = "1";
  console.log(`please enter your name:`);
});

ws.on('message', function incoming(data) {
  if(clientInfo.state == "2" || clientInfo.state == "3"){
    processor.process(data);
  }
});