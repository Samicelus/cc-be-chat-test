const commands = require('../constants/commands.json');

class commandService{
    constructor(){
        this.wss;
        this.setWss = this.setWss.bind(this);
        this.execommand = this.execommand.bind(this);
        this.popular = this.popular.bind(this);
        this.stats = this.stats.bind(this);
    }
    
    setWss(wss){
        this.wss = wss;
    }

    execommand(ws, content){
        let commandLine = content.split(" ");
        if(commands.includes(commandLine[0])){
            this[commandLine[0]].apply(this, [ws].concat(commandLine.slice(1)));
        }
    }

    popular(ws){
        this.wss.messageService.replyPopular(ws)
    }

    stats(ws, user){
        this.wss.userService.replyStats(ws, user);
    }
}

module.exports = new commandService();