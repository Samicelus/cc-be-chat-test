const test = require('ava');
const WebSocket = require('ws');
const serverConfig = require('../config/serverConfig.json');
let wss;
let dommyWs;

function endTestWithErr(t, msg){
    t.fail(msg);
    t.end();
}

test.before(t => {
    wss = require('../server.js');
});

test.before(t => {
    dommyWs = new WebSocket(`ws://${serverConfig.host}${serverConfig.port?":"+serverConfig.port:""}`);
    dommyWs.on('open', function open() {
        let msg = {
            user: '',
            type: 'regist',
            content: 'dommy'
        };
        dommyWs.send(JSON.stringify(msg));
    });
});

test.cb('terminate connection', t => {

    t.plan(1);
    let assert = 0;
    
    function ifEnd(){
        if(assert>=1){
            t.end();
        }
    }

    const ws = new WebSocket(`ws://${serverConfig.host}${serverConfig.port?":"+serverConfig.port:""}`);

    ws.on('open', function open() {
        let msg = {
            user: '',
            type: 'regist',
            content: 'foo'
        };
        ws.send(JSON.stringify(msg));
    });

    //terminate connection after regist
    ws.on('message', function incoming(data) {
        try{
            let msgBody = JSON.parse(data);
            if(msgBody.content == "OK"){
                ws.terminate();
                //other clients receive "system" message
                dommyWs.on('message', function incoming(data) {
                    try{
                        let msgBody = JSON.parse(data);
                        if(msgBody.type == 'chat' && msgBody.user == 'system'){
                            t.is(msgBody.content, 'foo has leaved the room');
                            assert += 1;
                            ifEnd();
                        }
                    }catch(e){
                        endTestWithErr(t, 'msg unparsable in dommyWs');
                    }
                });
            }
        }catch(e){
            endTestWithErr(t, 'msg unparsable in ws');
        }
    });

    setTimeout(function(){
        endTestWithErr(t, '5s timeout');
    },5000);
});

test.after('cleanup server', ()=>{
    wss.close();
});