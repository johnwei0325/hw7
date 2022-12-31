import Title from "../components/Title"
import LogIn from "../components/LogIn"
import  {useChat}  from "./hooks/useChat"
import { useState } from "react";
import RegisterModal from "../components/RegisterModal";
import { Button } from "antd";


const SignIn = ({me}) => {
    const {setMe, signedIn, setSignedIn, displayStatus, password, setPassword, savePassword, openRegister, setOpenRegister, signIn} = useChat();
    // const [open, setOpen] = useState(false);

    const handleLogin = (name, password) => {
        if (!name){
            displayStatus({
            type: "error",
            msg: "Missing user name",
            });
        }
        setSignedIn(true);
        // else if(!password){
        //     displayStatus({
        //         type: "error",
        //         msg: "Missing password",
        //     });
        // }else {/*signIn(name, password);*/ setSignedIn(true); console.log(name, password)}
    }

    const onCancel = () => {
        setOpenRegister(false)
    }

    const onCreate = (values) => {
        savePassword(values.name, values.password)
    }

    const handleRegister = () => {
        setOpenRegister(true)
    }

    return (
    <>
        <Title name={me}/>
        <LogIn me={me} setName={setMe} onLogin={handleLogin} password={password} setPassword={setPassword} handleRegister={handleRegister}/>
        
        <RegisterModal open={openRegister} onCancel={onCancel} onCreate={onCreate}></RegisterModal>
    </>
    );
}

export default SignIn;