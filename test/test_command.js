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

test.cb('send /popular', t => {

    t.plan(1);
    let assert = 0;
    let message_1 = {
        type: 'chat',
        content: 'dog cat duck',
        user: 'foo'
    };
    let message_2 = {
        type: 'chat',
        content: 'cat bull cat mouse',
        user: 'foo'
    };
    let message_3 = {
        type: 'chat',
        content: 'elephant duck dog',
        user: 'foo'
    };
    
    function ifEnd(){
        if(assert>=1){
            t.end();
        }
    }

    //receive chat message
    ws.on('message', function incoming(data) {
        try{
            let msgBody = JSON.parse(data);
            if(msgBody.user == 'system' && msgBody.type == 'chat'){
                t.is(msgBody.content, 'The most popular word in the last 5s is: cat');
                assert += 1;
                ifEnd();
            }
        }catch(e){
            endTestWithErr(t, 'msg unparsable in ws');
        }
    });


    ws.send(JSON.stringify(message_1));
    ws.send(JSON.stringify(message_2));
    ws.send(JSON.stringify(message_3));
    let message = {
        type: 'command',
        content: 'popular',
        user: 'foo'
    };
    ws.send(JSON.stringify(message));

    setTimeout(function(){
        endTestWithErr(t, '5s timeout');
    },5000);
});

test.after('cleanup ws cb', ()=>{
    ws.on('message', function incoming(data) {
    });
});

test.cb('send /stats [username], username exists', t => {

    t.plan(1);
    let assert = 0;
    
    function ifEnd(){
        if(assert>=1){
            t.end();
        }
    }

    //receive chat message
    ws.on('message', function incoming(data) {
        try{
            let msgBody = JSON.parse(data);
            if(msgBody.user == 'system' && msgBody.type == 'chat'){
                t.regex(msgBody.content, new RegExp('dommy has logged in for:'));
                assert += 1;
                ifEnd();
            }
        }catch(e){
            endTestWithErr(t, 'msg unparsable in ws');
        }
    });


    let message = {
        type: 'command',
        content: 'stats dommy',
        user: 'foo'
    };
    ws.send(JSON.stringify(message));

    setTimeout(function(){
        endTestWithErr(t, '5s timeout');
    },5000);
});

test.after('cleanup ws cb', ()=>{
    ws.on('message', function incoming(data) {
    });
});

test.cb('send /stats [username], username not exist', t => {

    t.plan(1);
    let assert = 0;
    
    function ifEnd(){
        if(assert>=1){
            t.end();
        }
    }

    //receive chat message
    ws.on('message', function incoming(data) {
        try{
            let msgBody = JSON.parse(data);
            if(msgBody.user == 'system' && msgBody.type == 'chat'){
                t.is(msgBody.content, 'no such user named: foo2');
                assert += 1;
                ifEnd();
            }
        }catch(e){
            endTestWithErr(t, 'msg unparsable in ws');
        }
    });


    let message = {
        type: 'command',
        content: 'stats foo2',
        user: 'foo'
    };
    ws.send(JSON.stringify(message));

    setTimeout(function(){
        endTestWithErr(t, '5s timeout');
    },5000);
});

test.after('cleanup server', ()=>{
    wss.close();
});