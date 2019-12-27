const test = require('ava');
const WebSocket = require('ws');
const serverConfig = require('../config/serverConfig.json');
let wss;
let dommyWs;
let ws;

function endTestWithErr(t, msg){
    t.fail(msg);
    t.end();
}

test.before(t => {
    wss = require('../server.js');
});

test.before.cb(t => {
    let ready = 0;
    dommyWs = new WebSocket(`ws://${serverConfig.host}${serverConfig.port?":"+serverConfig.port:""}`);
    dommyWs.on('open', function open() {
        let msg = {
            user: '',
            type: 'regist',
            content: 'dommy'
        };
        dommyWs.send(JSON.stringify(msg));
        ready += 1;
        if(ready >= 2){
            t.end();
        }
    });

    ws = new WebSocket(`ws://${serverConfig.host}${serverConfig.port?":"+serverConfig.port:""}`);

    ws.on('open', function open() {
        let msg = {
            user: '',
            type: 'regist',
            content: 'foo'
        };
        ws.send(JSON.stringify(msg));
        ready += 1;
        if(ready >= 2){
            t.end();
        }
    });
});

test.cb('send a string with abuse-word (for example: porno)', t => {

    t.plan(2);
    let assert = 0;
    let content = "a message with porno word";
    
    function ifEnd(){
        if(assert>=2){
            t.end();
        }
    }

    //receive chat message
    ws.on('message', function incoming(data) {
        try{
            let msgBody = JSON.parse(data);
            if(msgBody.user == 'foo' && msgBody.type == 'chat'){
                t.is(msgBody.content, "a message with ***** word");
                assert += 1;
                ifEnd();
            }
        }catch(e){
            endTestWithErr(t, 'msg unparsable in ws');
        }
    });

    //receive chat message
    dommyWs.on('message', function incoming(data) {
        try{
            let msgBody = JSON.parse(data);
            if(msgBody.user == 'foo' && msgBody.type == 'chat'){
                t.is(msgBody.content, "a message with ***** word");
                assert += 1;
                ifEnd();
            }
        }catch(e){
            endTestWithErr(t, 'msg unparsable in dommyWs');
        }
    });

    let message = {
        type: 'chat',
        user: 'foo',
        content
    };
    ws.send(JSON.stringify(message));

    setTimeout(function(){
        endTestWithErr(t, '5s timeout');
    },5000);
});

test.after('cleanup ws % dommyWs cb', ()=>{
    ws.on('message', function incoming(data) {
    });
    dommyWs.on('message', function incoming(data) {
    });
});

test.cb('send a string with similar non-abuse-word (for example: por)', t => {

    t.plan(2);
    let assert = 0;
    let content = "a message with por word";
    
    function ifEnd(){
        if(assert>=2){
            t.end();
        }
    }

    //receive chat message
    ws.on('message', function incoming(data) {
        try{
            let msgBody = JSON.parse(data);
            if(msgBody.user == 'foo' && msgBody.type == 'chat'){
                t.is(msgBody.content, content);
                assert += 1;
                ifEnd();
            }
        }catch(e){
            endTestWithErr(t, 'msg unparsable in ws');
        }
    });

    //receive chat message
    dommyWs.on('message', function incoming(data) {
        try{
            let msgBody = JSON.parse(data);
            if(msgBody.user == 'foo' && msgBody.type == 'chat'){
                t.is(msgBody.content, content);
                assert += 1;
                ifEnd();
            }
        }catch(e){
            endTestWithErr(t, 'msg unparsable in dommyWs');
        }
    });

    let message = {
        type: 'chat',
        user: 'foo',
        content
    };
    ws.send(JSON.stringify(message));

    setTimeout(function(){
        endTestWithErr(t, '5s timeout');
    },5000);
});

test.after('cleanup server', ()=>{
    wss.close();
});