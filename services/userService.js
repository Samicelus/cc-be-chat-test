const moment = require('moment');

class UserService{
    constructor(){
        this.wss;
        this.users = {};
        this.setWss = this.setWss.bind(this); 
        this.regist = this.regist.bind(this);
        this.toggleAlive = this.toggleAlive.bind(this);
        this.checkLeave = this.checkLeave.bind(this);
        this.leave = this.leave.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.replyStats = this.replyStats.bind(this);
    }

    setWss(wss){
        this.wss = wss;
    }

    regist(user, ws){
        let message = {
            type: "regist"
        };
        if(user.trim() && !Object.keys(this.users).includes(user)){
            this.users[user] = {
                name: user,
                loggedIn: new moment().format('YYYY-MM-DD HH:mm:ss'),
                isAlive: true
            };
            console.log(`[${new moment().format('YYYY-MM-DD HH:mm:ss')}] user: ${user} logged in...`);
            message.content = "OK";
            ws.socketid = user;
            this.wss.clients.forEach((client) => {
                if(client.socketid && client.socketid != user){
                    let info = {
                        type: "chat",
                        content: `${user} has joined the room`,
                        user: "system"
                    }
                    client.send(JSON.stringify(info));
                }
            });
            this.wss.messageService.replyRecentMsg(ws);
        }else{
            console.log(`Invalid Username`);
            message.content = "Invalid Username";
        }
        console.log(`send regist cb to ${user}`);
        ws.send(JSON.stringify(message));
    }

    toggleAlive(){
        for(let user in this.users){
            this.users[user].isAlive = false;
        }
    }

    checkLeave(){
        for(let user in this.users){
            if(this.users[user].isAlive === false){
                this.leave(user); 
            }
        }
    }

    disconnect(ws){
        let user = ws.socketid;
        let message = {
            type: "chat",
            content: `${user} has leaved the room`,
            user: "system"
        };
        delete this.users[user];
        ws.terminate();
        this.wss.clients.forEach((client) => {
            if(client.socketid && client.socketid != user){
                client.send(JSON.stringify(message));
            }
        });
    }

    leave(user){
        let message = {
            type: "chat",
            content: `${user} has leaved the room`,
            user: "system"
        };
        delete this.users[user];
        this.wss.clients.forEach((client) => {
            if(client.socketid && client.socketid != user){
                client.send(JSON.stringify(message));
            }
        });
    }

    replyStats(ws, user){
        let reply = {
            type: "chat",
            user: "system"
        };
        if(this.users[user]){
            let t0 = new moment(this.users[user].loggedIn);
            let tt = new moment();
            let dur = {
                d: tt.diff(t0,"days"),
                h: tt.subtract(tt.diff(t0,"days"), "days").diff(t0, "hours"),
                m: tt.subtract(tt.diff(t0,"hours"), "hours").diff(t0, "minutes"),
                s: tt.subtract(tt.diff(t0,"minutes"), "minutes").diff(t0, "seconds")
            };
            let diff = `${zeroPad(dur.d, 2)}d ${zeroPad(dur.h, 2)}h ${zeroPad(dur.m, 2)}m ${zeroPad(dur.s, 2)}s`;
            reply.content = `${user} has logged in for: ${diff}`;
        }else{
            reply.content = `no such user named: ${user}`;
        }      
        ws.send(JSON.stringify(reply));
    }
}

function zeroPad(num, pad){
    if(num.toString().length < pad){
        num = "0" + num;
        return zeroPad(num, pad)
    }else{
        return num.toString();
    }
}

module.exports = new UserService();