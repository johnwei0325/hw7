import { createContext, useContext, useState, useEffect } from "react";
import { Button, Input, message,  Tag } from 'antd'

const LOCALSTORAGE_KEY = "save_me";
const savedMe = localStorage.getItem(LOCALSTORAGE_KEY);

const ChatContext = createContext({
    status: {},
    me: "",
    signedIn: false,
    messages: [],
    sendMessage: () => {},
    clearMessages: () => {},
    password: "", 
    setPassword: () => {},
});

const client = new WebSocket('ws://localhost:4000')

const ChatProvider = (props) => {
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState({});
    const [signedIn, setSignedIn] = useState(false);
    const [me, setMe] = useState(savedMe || "");
    const [password, setPassword] = useState("")
    const [openRegister, setOpenRegister] = useState(false)
    const [chatBoxes, setChatBoxes] = useState([]);
    const sendData = async(data) => {
        await client.send(JSON.stringify(data));
    }

    useEffect(()=>{
        localStorage.setItem(LOCALSTORAGE_KEY, me);
    },[me, signedIn])

    client.onmessage = (byteString) => {
        const { data } = byteString;
        const [task, payload] = JSON.parse(data);
        switch(task) {
            case "cleared": {
                setMessages([]);
                break;
            }
            case "output" : {
                setMessages(payload);
                console.log('hi')
                break;
            }
            case "status" : {
                setStatus(payload);
                console.log('fuck')
                break;
            }
            case "init" : {
                setMessages(payload);
                break;  
            }
            case "registered" : {
                setOpenRegister(false);
                break;
            }
            case "personExisted" : {
                setOpenRegister(false);
                console.log(payload)
                displayStatus({type: "error", msg: `${payload} existed`})
                break;
            }
            case "signIn error" : {
                displayStatus({type: "error", msg: "account doesn't exist, please register first!"})
                break;
            }
            case "signIn" : {
                setSignedIn(true);
                displayStatus({type: "success", msg: `${payload} signed in!`})
                break
            }
            case "name used" : {
                displayStatus({type: "error", msg: "name used"})
                break
            }
            case 'wrong password' : {
                displayStatus({type: "error", msg: "wrong password"})
                break
            }
            case 'unread' : {
                console.log(payload)
                let tok = chatBoxes;
                for(let i=0; i<chatBoxes.length; i++){
                    if(chatBoxes[i].key === payload){
                        let label = Array.from(tok[i].label);
                        let num = 0;
                        console.log('label: ', label[0])
                        if(label[0]==='🔴'){
                            num=2;
                        }else if(!isNaN(label[0])){
                            num = label[0].charCodeAt(0)+1-48;
                        }else {
                            num=""
                        }
                        console.log('num: ', num)
                        tok[i].label = num + '🔴'+ tok[i].key
                    }
                }
                setChatBoxes(tok);
            }
            default: break;
        }
    }

    const startChat = (name, to) => {
        if(!name || !to) throw new Error('Name or to required.');
        console.log('startchat...')
        const payload = { name, to}
        sendData([
            'CHAT',
            payload
        ]);
        setMessages([])
    }

    const sendMessage = ({name, to, body}) => {
        console.log(name, to, body)
        if(!name || !to || !body) throw new Error('name or to or body required.');
        const payload = { name, to, body}
        sendData(['Message', payload]);
    } 

    const clearMessages = () => {
        console.log('sent')
        sendData(["clear"]);
    }

    const displayStatus = (s) => {
        if(s.msg) {
          const {type, msg} = s;
          const content = {
            content: msg, duration: 0.5 
          }
          switch (type) {
            case 'success':
            message.success(content)
            break
            case 'error':
            default:
            message.error(content)
            break
          }
        }
    }

    const savePassword = (name, password) => {
        const payload = { name, password}
        sendData(['Register', payload]);
    }

    const signIn = (name, password) => {
        const payload = { name, password}
        sendData(['SignIn', payload]);
    }

    return <ChatContext.Provider
                value={{
                    status, me, signedIn, messages, setMe, setSignedIn, 
                    sendMessage, clearMessages, displayStatus, startChat, password, setPassword, savePassword, openRegister, setOpenRegister
                    , signIn, chatBoxes, setChatBoxes
                }}
                {...props}
            />
}
const useChat = () => useContext(ChatContext);
export { ChatProvider, useChat };