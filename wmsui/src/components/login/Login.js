import Form from 'react-bootstrap/Form';
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import  Container  from 'react-bootstrap/Container';
import './Login.css';
import axios from "axios";
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from "react-router-dom";
import {useSelector,useDispatch} from 'react-redux';
import { login,setLoginUserInfo } from '../../redux-part/reducers/loginReducer';


const Login=()=>{

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errmessage, setErrMessage] = useState(false);
  const [validated, setValidated] = useState(false);

  const dispatch = useDispatch();
  const state=useSelector((state)=>state.loginReducer.isLogged);
  //console.log(state,"state");

  let navigate = useNavigate();

  function Register(){
    navigate('/register');
  }

  const CryptoJS = require('crypto-js');

  const encryptWithAES = (text) => {
    const passphrase = '123';
    return CryptoJS.AES.encrypt(text, passphrase).toString();
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      return
    }
    setValidated(true);
    let logindetails={
      username,
      password
    }
    logindetails.password=encryptWithAES(logindetails.password);
    axios.post(`${process.env.REACT_APP_API_URL}/login/validate` ,logindetails).then(
      res=>{
        console.log(res.data);
        setErrMessage(false);
        localStorage.setItem("auth",res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.details));
        let userDetails={username:res.data.details.username, firstName:res.data.details.firstName,
                        userId:res.data.details.userId,role:res.data.details.role};
        dispatch(login());
        dispatch(setLoginUserInfo(userDetails));
        navigate('/home');
      }
    ).catch(err=>{
      console.log(err);
      setErrMessage(true);
    })
  };
    return(<>
    <Container className="login-center-items text-center">
    <div className=" form-signin w-100 m-auto">
        <h1>Login</h1>
        <Form noValidate validated={validated}>
        {
        ((errmessage === true)&& username!=="" && password!=="")? 
        <div>
          <Alert variant="danger">invalid login</Alert>
        </div>:<div></div>
      }
        <Row>
      <Form.Group as={Col} controlId="validationCustom06" lg={{span:4,offset:4}}>
      <Form.Label>Username</Form.Label>
        <Form.Control 
        type="text" 
        value={username} 
          onChange={(e) => { setUsername(e.target.value); setErrMessage(false)}} 
          required />
          <Form.Control.Feedback type="invalid">
            Username is required.
          </Form.Control.Feedback>
        </Form.Group>
      </Row>
      <Row>
        <Form.Group as={Col} controlId="validationCustom03" lg={{span:4,offset:4}}>
          <Form.Label>Password</Form.Label>
          <Form.Control 
          type="password" 
          value={password} 
          onChange={(e) => { setPassword(e.target.value); setErrMessage(false)}}
          required />
          <Form.Control.Feedback type="invalid">
            Password is required.
          </Form.Control.Feedback>
        </Form.Group>
        </Row>   
        <Row>
        <Col>
        <br></br> 
        <b>Authorized Access Only</b> 
        <br></br>
        <br></br>
        <Button type="submit" onClick={(e)=>{handleSubmit(e)}}>Login</Button>
        </Col>
        </Row>
      <br/>
    </Form>
    </div>
    </Container>
        </>)
}

export default Login;