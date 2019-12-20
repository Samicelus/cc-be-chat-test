const moment = require('moment');
const Abuse  = require('../lib/abuse');
const abuse = new Abuse();

class MsgService{
    constructor(){
        this.wss;
        this.eventHandler;
        this.chatLogs = [];
        this.setWss = this.setWss.bind(this);
        this.setEvents = this.setEvents.bind(this);
        this.chat = this.chat.bind(this);
        this.saveMsg = this.saveMsg.bind(this);
        this.replyRecentMsg = this.replyRecentMsg.bind(this);
        this.replyPopular = this.replyPopular.bind(this);
    }

    setWss(wss){
        this.wss = wss;
    }

    setEvents(eventHandler){
        this.eventHandler = eventHandler;

        let that = this;
        this.eventHandler.on("popular", function(ws){
            that.replyPopular(ws);
        });
        this.eventHandler.on("login", function(ws){
            that.replyRecentMsg(ws);
        });
    }

    saveMsg(user, content, time){
        if(this.chatLogs.length >= 50){
            this.chatLogs.shift();
        }
        this.chatLogs.push({
            user,
            content,
            time
        });
    }

    chat(user, content){
        let filtered = abuse.findWordInStr(content, 0);
        this.saveMsg(user, filtered, new moment().format('YYYY-MM-DD HH:mm:ss'));
        this.wss.clients.forEach((client) => {
            let chatMsg = {
                type: "chat",
                content: filtered,
                user,
            }
            client.send(JSON.stringify(chatMsg));
        });
    }

    replyRecentMsg(ws){
        this.chatLogs.forEach((msg)=>{
            let replied = {
                type: "chat",
                content: msg.content,
                user: msg.user,
                time: msg.time
            }
            ws.send(JSON.stringify(replied));
        })
    }

    replyPopular(ws){
        let lastTime;
        if(this.chatLogs[0]){
            lastTime = this.chatLogs.slice(-1)[0].time;
        }
        let limit = moment(lastTime).subtract(5, 'second').format('YYYY-MM-DD HH:mm:ss');
        let popularity = {};
        this.chatLogs.forEach((msg)=>{
            if(msg.time >= limit){
                let words = msg.content.split(/\s+/);
                words.forEach((word)=>{
                    if(!popularity[word]){
                        popularity[word] = 1;
                    }else{
                        popularity[word] += 1;
                    }
                })
            }
        })
        let maxTimes = 0;
        let popularWord = "";
        for(let word in popularity){
            if(popularity[word] > maxTimes){
                maxTimes = popularity[word];
                popularWord = word;
            }
        }
        let reply = {
            type: "chat",
            content: "no chat log in last 5s",
            user: "system"
        };
        if(maxTimes){
            reply.content = `The most popular word in the last 5s is: ${popularWord}`;
        }
        
        ws.send(JSON.stringify(reply));
    }
}

module.exports = new MsgService();