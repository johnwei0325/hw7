import { Input, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";

const LogIn = ({me, setName, onLogin, password, setPassword, handleRegister}) => {
    return (
        <>
        <Input size="Large"
            style = {{ width: 300, marginBottom: 10, marginTop: 50}}
            prefix={<UserOutlined/>}
            placeholder="Enter your name"
            value={me}
            onChange={(e)=> {setName(e.target.value);}}
            />
        <Input.Search
            size="Large"
            style = {{ width: 300,marginBottom: 50}}
            type = "password"
            placeholder="Enter password"
            value={password}
            onChange={(e)=> setPassword(e.target.value)}
            enterButton="Sign In"
            onSearch={(password)=>{onLogin(me, password);}}
        />
        <Button type="primary" onClick={handleRegister}> Register </Button>
        </>
    )
}

export default LogIn;