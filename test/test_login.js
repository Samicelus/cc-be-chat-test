const test = require('ava');
const WebSocket = require('ws');
const serverConfig = require('../config/serverConfig.json');
let dommyWs;

test.before(t => {
    require('../server.js');
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

test.cb('login with unused name', t => {

    t.plan(2);
    let assert = 0;
    
    function ifEnd(){
        if(assert>=2){
            t.end();
        }
    }

    //other clients receive "system" message
    dommyWs.on('message', function incoming(data) {
        try{
            let msgBody = JSON.parse(data);
            if(msgBody.type == 'chat' && msgBody.user == 'system'){
                t.is(msgBody.content, 'foo has joined the room');
                assert += 1;
                ifEnd();
            }
        }catch(e){
            t.fail('msg unparsable in dommyWs');
        }
    });

    const ws = new WebSocket(`ws://${serverConfig.host}${serverConfig.port?":"+serverConfig.port:""}`);

    ws.on('open', function open() {
        let msg = {
            user: '',
            type: 'regist',
            content: 'foo'
        };
        ws.send(JSON.stringify(msg));
    });

    //receive callback with "OK"
    ws.on('message', function incoming(data) {
        try{
            let msgBody = JSON.parse(data);
            t.is(msgBody.content, 'OK');
            assert += 1;
            ifEnd();
        }catch(e){
            t.fail('msg unparsable in ws');
        }
    });
});

test.after('cleanup dommy cb', ()=>{
    dommyWs.on('message', function incoming(data) {
    });
});

test.cb('login with exist name', t => {
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
            content: 'dommy'
        };
        ws.send(JSON.stringify(msg));
    });

    //receive callback with "Invalid Username"
    ws.on('message', function incoming(data) {
        try{
            let msgBody = JSON.parse(data);
            t.is(msgBody.content, 'Invalid Username');
            assert += 1;
            ifEnd();
        }catch(e){
            t.fail('msg unparsable in ws');
        }
    });
});

test.after('cleanup dommy cb', ()=>{
    dommyWs.on('message', function incoming(data) {
    });
});

test.cb('login with white space or null', t => {
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
            content: 'foo foo'
        };
        ws.send(JSON.stringify(msg));
    });

    //receive callback with "Invalid Username"
    ws.on('message', function incoming(data) {
        try{
            let msgBody = JSON.parse(data);
            t.is(msgBody.content, 'Invalid Username');
            assert += 1;
            ifEnd();
        }catch(e){
            t.fail('msg unparsable in ws');
        }
    });
});