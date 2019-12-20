const messageTypes = require('../constants/messageTypes.json');
const moment = require('moment'); 

class Processor{
    constructor(clientInfo, messenger, eventHandler){
        this.clientInfo = clientInfo;
        this.messenger = messenger;
        this.eventHandler = eventHandler;
        this.process = this.process.bind(this);
        this.regist = this.regist.bind(this);

        let that = this;
        this.eventHandler.on("login", function(){
            that.clientInfo.state = "3";
        });
        this.eventHandler.on("logout", function(){
            that.clientInfo.state = "1";
            console.log(`${content}, please enter your name:`);
        });
    }

    process(incoming){
        try{
            let {type, content, user, time} = JSON.parse(incoming);
            if(messageTypes.includes(type)){
                this[type](content, user, time);
            }
        }catch(e){
            throw e;
        }
    }

    regist(content){
        if(content == "OK"){
            this.eventHandler.emit('login');
            // this.clientInfo.state = "3";
            // this.messenger.setUser();
            // console.log(`chat>`);
        }else{
            this.eventHandler.emit('logout');
            // this.clientInfo.state = "1";
            // console.log(`${content}, please enter your name:`);
        }
    }

    chat(content, user, time){
        console.log(`[${time || new moment().format('YYYY-MM-DD HH:mm:ss')}] ${user}: ${content}`);
    }
}

module.exports = Processor;