import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";


const Profile=()=>{

  const [userdatafromreg, setuserdatafromreg] = useState("");
  let userid = useSelector((state) => state.loginReducer.userInfo.userId);
  // console.log(userid);
  useEffect(() => {
    if(userid==null || userid==""){
      if(localStorage.getItem('user')){
        userid=JSON.parse(localStorage.getItem("user")).userId;
      }}
    axios.post(`${process.env.REACT_APP_API_URL}/profile/finduser`, {userid}).then(
      res=>{
        // console.log(res.data);  
        setuserdatafromreg(res.data[0]);
      
      }
    ).catch(err=>{
      console.log(err); 
    })

  }, []);

  let navigate = useNavigate();

  const editinformation = (e) => {
    e.preventDefault();
    // console.log("editing");
    navigate('/editpersonalinfo');
}

return(
<>
  <br></br>
  <br></br>
<Container fluid>
  <Row>
    <Col lg={{span:3, offset:2}}>
      <img src="https://static.vecteezy.com/system/resources/previews/002/318/271/original/user-profile-icon-free-vector.jpg"
    className="rounded float-left" width="200" height="200" alt="logo"/>
    </Col>
    <Col lg={{span:5}}>
    <Container>
      <h5>
      <Row className="p-2">
        <Col xs={{span:3}}>Name</Col>
        <Col xs={{span:5}}>: {userdatafromreg.fname + " "+ userdatafromreg.lname}</Col>
      </Row>
      <Row className="p-2">
        <Col xs={{span:3}}>Username</Col>
        <Col xs={{span:5}}>: {userdatafromreg.username}</Col>
      </Row>
      {userdatafromreg.role!=="manager"?<Row className="p-2">
        <Col xs={{span:3}}>ID</Col>
        <Col xs={{span:5}}>: {userdatafromreg.i_d}</Col>
      </Row>:null}
      <Row className="p-2">
        <Col xs={{span:3}}>Email</Col>
        <Col xs={{span:6}}>: {userdatafromreg.email}</Col>
      </Row>
      {userdatafromreg.role==="customer"?<Row className="p-2">
        <Col xs={{span:3}}>Customer Name</Col>
        <Col xs={{span:5}}>: {userdatafromreg.customername}</Col>
      </Row>:null}
      {userdatafromreg.role==="customer"?<Row className="p-2">
        <Col xs={{span:3}}>Customer Type</Col>
        <Col xs={{span:5}}>: {userdatafromreg.customertype}</Col>
      </Row>:null}
      <Row className="p-2">
        <Col xs={{span:3}}>Phone</Col>
        <Col xs={{span:5}}>: {userdatafromreg.phone}</Col>
      </Row>
      <Row className="p-2">
        <Col xs={{span:3}}>Date Of Birth</Col>
        <Col xs={{span:5}}>: {userdatafromreg.dob}</Col>
      </Row>
      <Row className="p-2">
        <Col xs={{span:3}}>Address</Col>
        <Col xs={{span:5}}>: {userdatafromreg.address}</Col>
      </Row>
      <Row className="p-2">
        <Col xs={{span:3}}>City<br/></Col>
        <Col xs={{span:5}}>: {userdatafromreg.city}</Col>
      </Row>
      <Row className="p-2">
        <Col xs={{span:3}}>Zip<br/></Col>
        <Col xs={{span:5}}>: {userdatafromreg.zip}</Col>
      </Row>
      <Row className="p-2">
        <Col xs={{span:3}}>State<br/></Col>
        <Col xs={{span:5}}>: {userdatafromreg.state}</Col>
      </Row>
      <Row>
        <Col>
        <Button variant="primary" onClick={editinformation}>Edit Personal information</Button>
        </Col>
      </Row>
      </h5>
    </Container>
    </Col>
  </Row>
</Container>
</>
)
}

export default Profile;