import styled from "styled-components";
// import { Button, Input, message,  Tag } from 'antd'
import {useChat} from "./hooks/useChat"
import { useState, useEffect, useRef} from 'react';
import SignIn from "./SignIn";
import ChatRoom from "./ChatRoom";
import Title from "../components/Title"

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 500px;
  margin: auto;
`;

const App = () => {
  const { status, me, signedIn, setSignedIn, displayStatus } = useChat();

  return (
    <Wrapper> {signedIn? <ChatRoom me={me}/> /*<h1>hi</h1>*/: <SignIn me={me}/>} </Wrapper>
  )
 }

 export default App;