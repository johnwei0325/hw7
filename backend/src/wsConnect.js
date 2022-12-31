import mongoose, { Mongoose } from 'mongoose';
import {UserModel, MessageModel, ChatBoxModel, PasswordModel} from './models/message.js'
// import ChatBoxModel from './models/message.js'
// const {UserModel, MessageModel, ChatBoxModel} = require("./models/message")
const toID = mongoose.Types.ObjectId;
const makeName = (name, to) => { return [name, to].sort().join('_');};

const validateUser = async (name) => {
    const existing = await UserModel.findOne({ name })
    //const existing = false
    if(existing) return existing;
    if(!existing){
        const tok = await new UserModel({ name }).save();
        //existing = await UserModel.findOne({ name })
        return tok;
    }
}

const validateChatBox = async (name, participants) => {
    let box = await ChatBoxModel.findOne({ name });
    if (!box){
        box = await new ChatBoxModel({ name, users: participants }).save();
        console.log('chatbox not found')
    }
    return box.populate(["users", {path: 'messages', populate: 'sender' }]);
    
};

const sendData = (data, ws) => {
    ws.send(JSON.stringify(data)); 
}

const sendStatus = (payload, ws) => {
    sendData(["status", payload], ws); 
}

const broadcastMessage = (wss, data, status, ws) => {
    const [task, payload] = data
    if(task==="cleared"){
        wss.clients.forEach((client) => {
            sendData(data, client);
            sendStatus(status, client);
            console.log(client)
        });
    }else {
        for (let [key, value] of Object.entries(chatBoxes)) {
            if(key===ws.box){
                chatBoxes[key].forEach((value) => {
                    sendData(data, value);
                    sendStatus(status, value);
                })
            }
        }
    }   
};

const chatBoxes = {};
const unactiveBoxes = {};

export default{
    initData: (ws) => {
        Message.find().sort({ created_at: -1 }).limit(100)
        .exec((err, res) => {
        if (err) throw err;
        // initialize app with existing messages
        sendData(["init", res], ws);
        });
    },
    onMessage: (wss,ws) => (
        async (byteString) => {
            // console.log('str: ', byteString.data)
            const {data} = byteString
            const [task, payload] = JSON.parse(data)
            switch (task) {
                case 'Message': {
                    const {name, to, body} = payload
                    let chatBoxName = makeName(name, to);
                    const sender = await validateUser(name);
                    const acceptor = await validateUser(to);
                    const chatBox = await validateChatBox(chatBoxName, [sender, acceptor]);
                    //console.log('id',chatBox)
                    const message = await new MessageModel({ chatBox: chatBox, sender: sender, body: body });
                    message.save();
                    chatBox.messages.push(message);
                    chatBox.save();
                    let data = {name: '', body: ''}
                    let returnData = [];
                    for(let i=0; i<chatBox.messages.length; i++){
                        data.body = chatBox.messages[i].body;
                        data.name = await chatBox.messages[i].sender.populate();
                        data.name = data.name.name
                        console.log(data, i)
                        returnData.push({name: data.name, body: data.body})//data;
                    }
                    broadcastMessage(
                        wss,['output', returnData],
                        {
                            type: 'success',
                            msg: 'Message sent.'
                        },ws
                    )
                    for (let [key, value] of Object.entries(unactiveBoxes)) {
                        if(key===ws.box){
                            unactiveBoxes[key].forEach((value) => {
                                console.log('hi', key)
                                sendData(["unread", name], value);
                            })
                        }
                    }
                    
                    break;
                }
                case 'clear' : {
                    console.log('clear')
                    MessageModel.deleteMany({}, ()=>{
                        broadcastMessage(
                            wss,['cleared'],
                            {
                                type: 'info', msg: 'Message cache cleared.'
                            },ws
                        )
                    })
                    ChatBoxModel.deleteMany({},()=>{
                        broadcastMessage( wss,['cleared'],{ type: 'info', msg: 'Chatbox cache cleared.' },ws)
                    })
                    UserModel.deleteMany({}, ()=>{
                        broadcastMessage( wss,['cleared'],{ type: 'info', msg: 'User cache cleared.' },ws)
                    })
                    break;
                }
                case 'CHAT' : {
                    const {name, to} = payload
                    if (ws.box !== "" && chatBoxes[ws.box]){
                        // user(ws) was in another chatbox
                        chatBoxes[ws.box].delete(ws);
                        unactiveBoxes[ws.box].add(ws);
                    }
                    let chatBoxName = makeName(name, to);
                    ws.box = chatBoxName
                    if (!chatBoxes[chatBoxName]){
                        chatBoxes[chatBoxName] = new Set();
                        unactiveBoxes[chatBoxName] = new Set();
                    }
                    chatBoxes[chatBoxName].add(ws); 
                    unactiveBoxes[chatBoxName].delete(ws);
                    console.log(chatBoxes);

                    console.log('create chatbox')
                    const sender = await validateUser(name);
                    const acceptor = await validateUser(to); 
                    const chatBox = await validateChatBox(makeName(name, to),[sender, acceptor]);
                    sender.save();
                    acceptor.save()
                    let data = {name: '', body: ''}
                    let returnData = [];
                    for(let i=0; i<chatBox.messages.length; i++){
                        data.body = chatBox.messages[i].body;
                        data.name = await chatBox.messages[i].sender.populate();
                        data.name = data.name.name
                        returnData.push({name: data.name, body: data.body})//data;
                    }

                    sendData(['init', returnData], ws)
                    break;
                }
                case "Register" : {
                    const {name, password} = payload;
                    console.log(payload)
                    let nameExist = await PasswordModel.findOne({ name: name });
                    let exist = await PasswordModel.findOne({ name: name, password: password });
                    if (!exist&&!nameExist){
                        let newperson = await new PasswordModel({ name, password }).save();
                        sendData(['registered'], ws)
                    }else if(name&&!nameExist){
                        sendData(['name used'], ws)
                    }else{
                        sendData(['personExisted', name], ws)
                    }
                    break
                }
                case "SignIn" : {
                    const {name, password} = payload;
                    console.log(payload)
                    let nameExist = await PasswordModel.findOne({ name: name });
                    let exist = await PasswordModel.findOne({ name: name, password: password });
                    if (!nameExist){
                        sendData(['signIn error'], ws)
                    }else if(!exist){
                        sendData(['wrong password'], ws)
                    }else{
                        sendData(['signIn', name], ws)
                    }
                    break
                }
            }
        }
    )
}