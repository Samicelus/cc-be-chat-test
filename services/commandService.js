const commands = require('../constants/commands.json');

class commandService{
    constructor(){
        this.wss;
        this.eventHandler;
        this.setWss = this.setWss.bind(this);
        this.setEvents = this.setEvents.bind(this);
        this.execommand = this.execommand.bind(this);
        this.popular = this.popular.bind(this);
        this.stats = this.stats.bind(this);
    }
    
    setWss(wss){
        this.wss = wss;
    }

    setEvents(eventHandler){
        this.eventHandler = eventHandler;

        let that = this;
    }

    execommand(ws, content){
        let commandLine = content.split(" ");
        if(commands.includes(commandLine[0])){
            this[commandLine[0]].apply(this, [ws].concat(commandLine.slice(1)));
        }
    }

    popular(ws){
        this.eventHandler.emit("popular", ws);
    }

    stats(ws, user){
        this.eventHandler.emit("status", ws, user);
    }
}

module.exports = new commandService();