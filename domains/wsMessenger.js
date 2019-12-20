const messageTypes = require('../constants/messageTypes.json');

class Messenger{
    constructor(name, ws, eventHandler){
        this.name = name;
        this.user = "";
        this.ws = ws;
        this.eventHandler = eventHandler;
        this.sendMsg = this.sendMsg.bind(this);

        let that = this;
        this.eventHandler.on("login", function(){
            that.setUser();
            console.log(`chat>`);
        });
    }

    setUser(){
        this.user = this.name;
    }

    sendMsg(type, content){
        if(messageTypes.includes(type)){
            let message = {
                user: this.user,
                type,
                content
            };
            this.ws.send(JSON.stringify(message));
        }else{
            throw Error(`unknown message type :${type}`);
        }
    }
}

module.exports = Messenger;