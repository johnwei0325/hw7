import './App.css'
import { Button, Input, message, Tabs, Modal, Form} from 'antd'
import { useChat } from "./hooks/useChat"
import { useState, useEffect, useRef } from 'react';
import styled from "styled-components";
import Title from "../components/Title"
import Message from "../components/Message"
import ChatModal from '../components/ChatModal';

const ChatBoxesWrapper = styled(Tabs)`
    width: 100%;
    height: 300px;
    background: #eeeeee52;
    border-radius: 10px;
    margin: 20px;
    padding: 20px;
`;

const ChatBoxWrapper = styled.div`
  height: calc(240px - 36px);
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const FootRef = styled.div`
 height: 20px;
`
;

const initialItems = [
  { label: 'Tab 1', children: 'Content of Tab 1', key: 'Tab1' },
  { label: 'Tab 2', children: 'Content of Tab 2', key: 'Tab2' },
  {
    label: 'Tab 3',
    children: 'Content of Tab 3',
    key: '3',
    closable: false,
  },
];

const ChatRoom = ({me}) => {
  const {status, messages, sendMessage, clearMessages, displayStatus, startChat, chatBoxes, setChatBoxes} = useChat();
  const [username, setUsername] = useState('');
  const [body, setBody] = useState('');
  const [msgSent, setMsgSent] = useState(false);
  const [activeKey, setActiveKey] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  
  const [render, setRender] = useState(false);
  const bodyRef = useRef(null);
  const msgFooter = useRef(null);

  const initChat = (chat) => {
    return(
        chat.length === 0 ? (
          <p style={{color: '#ccc'}}> No messages... </p>
        ) : (
          <ChatBoxWrapper>
            {chat.map(
              ({name, body}, i) => (
                <Message isMe={name === me} message={body} key={i} name={name}/>))}
                <FootRef ref={msgFooter} />
          </ChatBoxWrapper>
        )
    )
    
  }

  const createChatBox = (friend) => {
    if (chatBoxes.some
      (({key}) => key === friend)) {
        throw new Error(friend +
        "'s chat box has already opened.");
      }
      
      const chat = initChat(messages);
      setChatBoxes([...chatBoxes,
        { label: friend , children: chat,
      key: friend }]);

      startChat(me, friend);
      setMsgSent(true);
      return friend;
  };

  useEffect(()=>{
    let tokchatboxes = chatBoxes;
    let idx = -1;
    for(let i=0; i<chatBoxes.length; i++){
      if(chatBoxes[i].key===activeKey){
        idx=i;
      }
    }
    if(idx>-1){
    tokchatboxes[idx].children = initChat(messages);
    setChatBoxes(tokchatboxes);}  
    setMsgSent(true)
    
  },[messages])

  // const removeChatBox = (targetKey, activeKey) => {
  //   const index = chatBoxes.findIndex
  //     (({key}) => key === activeKey);
  //   const newChatBoxes = chatBoxes
  //   .filter(({key}) =>
  //     key !== targetKey);
  //   setChatBoxes(newChatBoxes);
    
  //   return(
  //     activeKey ? activeKey === targetKey? 
  //     index === 0?
  //     '' : chatBoxes[index - 1].key
  //     : activeKey : ''
  //   )
  // };
 
  const onCancel = () => {
    setModalOpen(false);
  }

  const onCreate = (values) => {
    const newActiveKey = values.name;
    console.log('newActiveKey: ', newActiveKey)
    createChatBox(newActiveKey);
    
    setActiveKey(newActiveKey);
    setModalOpen(false);
  }

  
  const scrollToBottom = () => {
      msgFooter.current?.scrollIntoView({behavior: 'smooth', block: "start"});
  };

  useEffect(()=>{
    scrollToBottom();
    setMsgSent(false); 
  },[msgSent]);

  useEffect(() => {
    displayStatus(status); console.log('render')}, [status])

  const removeChatBox = (targetKey, activeKey) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;
    chatBoxes.forEach((item, i) => {
      if (item.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newPanes = chatBoxes.filter(item => item.key !== targetKey);
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    setChatBoxes(newPanes);
    setActiveKey(newActiveKey);
    resetName(newActiveKey);
  };

  const resetName = (key) => {
    let tok = chatBoxes;
    for(let i=0; i<chatBoxes.length; i++){
      if(chatBoxes[i].key === key){
        tok[i].label = tok[i].key
      }
    }
  }
    
        
return (
  <>
  <Button type="primary" danger onClick={clearMessages}>
          Clear
    </Button>
    <Title name={me}></Title>
    <ChatBoxesWrapper  
      type="editable-card" 
      items={chatBoxes}
      activeKey={activeKey}
      onChange={(key) => {
        setActiveKey(key);
        resetName(key);
        startChat(me, key);
        // setMsgSent(true)
      }}
      onEdit={(targetKey, action) => {
        if(action === 'add'){
          setModalOpen(true);
        }else if(action === 'remove'){
          setActiveKey(removeChatBox(targetKey, activeKey));
        }
      }}
    />
    <ChatModal open={modalOpen} onCancel={onCancel} onCreate={onCreate}></ChatModal>
    <Input.Search
      ref={bodyRef}
      enterButton="Send"
      placeholder="Type a message here..."
      value={body}
      onChange={(e) => setBody(e.target.value)}
      onSearch = {(msg) => {
        if(!msg){
          displayStatus({
            type: 'error',
            msg: 'Please enter message body.'
          })
          return;
        }else if(activeKey === ''){
          displayStatus({
            type: 'error',
            msg: 'Please add a chatbox first.',
          });
          setBody('')
          return;
        }
        console.log("hi", me, activeKey, msg)
        sendMessage({name: me, to: activeKey, body: msg}); 
        setBody('')
        setMsgSent(true)
      }}
    ></Input.Search>
  </>
  )
}

export default ChatRoom;