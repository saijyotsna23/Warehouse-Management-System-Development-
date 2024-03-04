import axios from "axios";
import { useEffect, useState, useRef} from "react";
import { Button, Col, Container, Form, Modal, Row } from "react-bootstrap"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import React from "react";
import { LoadScript, StandaloneSearchBox} from "@react-google-maps/api";

const EditPersonalInfo = () => {

  const inputRef=useRef();
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [i_d, setI_d] = useState("");
  const [role, setRole] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [errmessagephone, setErrMessagePhone] = useState(false);
  const [errmessagezip, setErrMessagezip] = useState(false);
  const [updatesuccess, setUpdateSuccess] = useState(false);
  const [validated, setValidated] = useState(false);
  const [customername, setCustomerName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  let userid = useSelector((state) => state.loginReducer.userInfo.userId);
  // console.log(userid);
  let navigate = useNavigate();

  function redirectToProfile() {
    navigate('/profile');
  }

  const extractComponent = (addressComponents, componentType) => {
    for (const component of addressComponents) {
      for (const type of component.types) {
        if (type === componentType) {
          return component.long_name;
        }
      }
    }
    return null; // Return null if the component is not found
  };

  const handlePlaceChanged = () =>{
    const [place] = inputRef.current.getPlaces();
    if(place)
    {
      //console.log(place.formatted_address);
      setLatitude(place.geometry.location.lat());
      setLongitude(place.geometry.location.lng());
      const addressComponents = place.address_components;
      setCity(extractComponent(addressComponents, 'locality'));
      setState(extractComponent(addressComponents, 'administrative_area_level_1'));
      setZip(extractComponent(addressComponents, 'postal_code'));
      setAddress(place.formatted_address.split(',').slice(0, -3).join(',').trim());
    }
  }

  function MyVerticallyCenteredModal(props) {
    return (
      <Modal
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={props.show}
        onHide={redirectToProfile}
      >
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body>
          <h4>Congratulations your account was updated successfully</h4>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={redirectToProfile}>Profile</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  useEffect(() => {
    if(userid==null || userid==""){
      if(localStorage.getItem('user')){
        userid=JSON.parse(localStorage.getItem("user")).userId;
      }}
    axios.post(`${process.env.REACT_APP_API_URL}/profile/getedituser`, { userid }).then(
      res => {

        console.log(res.data, "response data of user");
        setFname(res.data[0].fname);
        setLname(res.data[0].lname);
        setI_d(res.data[0].i_d);
        setRole(res.data[0].role);
        setCustomerName(res.data[0].customername);
        setPassword(res.data[0].password);
        setDob(res.data[0].dob);
        setPhone(res.data[0].phone);
        setAddress(res.data[0].address);
        setZip(res.data[0].zip);
        setCity(res.data[0].city);
        setState(res.data[0].state);
        setLatitude(res.data[0].latitude);
        setLongitude(res.data[0].longitude);
      }
    ).catch(err => {
      console.log(err);
    })

  }, []);

  const update = (e) => {
    e.preventDefault();
  
  
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }
    else if ( String(zip).length !== 5 &&  String(phone).length !== 10) {
      setErrMessagePhone(true);
      setErrMessagezip(true);
    }
    else if ( String(phone).length !== 10) {
      console.log("lets go phn error");
      setErrMessagePhone(true);
      setErrMessagezip(false);
    }
    else if ( String(zip).length !== 5) {
      console.log(zip.length);
      setErrMessagePhone(false);
      setErrMessagezip(true);
    }
    
    else {
      setErrMessagePhone(false);
      setErrMessagezip(false);

      let updatedetails = {
        userid,
        i_d,
        fname,
        lname,
        dob,
        phone,
        password,
        address,
        zip,
        city,
        state,
        customername,
        latitude,
        longitude
      }

      axios.post(`${process.env.REACT_APP_API_URL}/registration/update`, updatedetails).then(
        res => {
          console.log(res,"update response");
          setUpdateSuccess(true);
        }
      ).catch(err => {
        console.log(err,"error update");
        setValidated(true);
      })
    }
  }

  return (
    <>
      <br></br>
      <br></br>
      <Container fluid>
        <Row>
          <Col lg={{ span: 3, offset: 2 }}>
            <img
              src="https://static.vecteezy.com/system/resources/previews/002/318/271/original/user-profile-icon-free-vector.jpg"
              className="rounded float-left"
              width="200"
              height="200"
              alt="logo"
            />
          </Col>
          <Col lg={{ span: 5 }}>
            <Container>
              <Form noValidate validated={validated}>
                <Row className="p-2">
                  <Col xs={{ span: 3 }}>First Name</Col>
                  <Col xs={{ span: 5 }}>
                    <Form.Control
                      type="text"
                      value={fname}
                      onChange={(e) => {
                        setFname(e.target.value);
                      }}
                      required
                    />
                  </Col>
                </Row>
                <Row className="p-2">
                  <Col xs={{ span: 3 }}>Last Name</Col>
                  <Col xs={{ span: 5 }}>
                    <Form.Control
                      type="text"
                      value={lname}
                      onChange={(e) => {
                        setLname(e.target.value);
                      }}
                      required
                    />
                  </Col>
                </Row>
                {role !== "manager" ? (
                  <Row className="p-2">
                    <Col xs={{ span: 3 }}>ID</Col>
                    <Col xs={{ span: 5 }}>
                      <Form.Control
                        type="text"
                        value={i_d}
                        onChange={(e) => {
                          setI_d(e.target.value);
                        }}
                        required
                      />
                    </Col>
                  </Row>
                ) : null}
                <Row className="p-2">
                  <Col xs={{ span: 3 }}>password</Col>
                  <Col xs={{ span: 6 }}>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      required
                    />
                  </Col>
                </Row>
                <Row className="p-2">
                  <Col xs={{ span: 3 }}>Phone</Col>
                  <Col xs={{ span: 5 }}>
                    <Form.Control
                      type="text"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                      }}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter a valid phone number.
                    </Form.Control.Feedback>
                    {errmessagephone === true ? (
                      <div>
                        <p className="text-danger">
                          phone number must be 10 digits
                        </p>
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </Col>
                </Row>
                {role === "customer" ? (
                  <Row className="p-2">
                    <Col xs={{ span: 3 }}>Customer Name</Col>
                    <Col xs={{ span: 5 }}>
                      <Form.Control
                        type="text"
                        value={customername}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                        }}
                        required
                      />
                    </Col>
                  </Row>
                ) : null}
                <Row className="p-2">
                  <Col xs={{ span: 3 }}>Date Of Birth</Col>
                  <Col xs={{ span: 5 }}>
                    <Form.Control
                      type="text"
                      value={dob}
                      onChange={(e) => {
                        setDob(e.target.value);
                      }}
                      required
                    />
                  </Col>
                </Row>
                <Row className="p-2">
                <Col xs={{ span: 3 }}>Pick Address</Col>
                  <Col lg={{ span: 5 }}>
                    <LoadScript
                      googleMapsApiKey={process.env.REACT_APP_GOOGLE_API}
                      libraries={["places"]}
                    >
                      <StandaloneSearchBox
                        onLoad={(ref) => (inputRef.current = ref)}
                        onPlacesChanged={handlePlaceChanged}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Location"
                          required
                        ></input>
                      </StandaloneSearchBox>
                    </LoadScript>
                  </Col>
                </Row>
                <Row className="p-2">
                  <Col xs={{ span: 3 }}>Address</Col>
                  <Col xs={{ span: 5 }}>
                    <Form.Control
                      type="text"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                      }}
                      readOnly
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a valid Address.
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                <Row className="p-2">
                  <Col xs={{ span: 3 }}>
                    City
                    <br />
                  </Col>
                  <Col xs={{ span: 5 }}>
                    <Form.Control
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                      }}
                      readOnly
                      required
                    />
                  </Col>
                </Row>
                <Row className="p-2">
                  <Col xs={{ span: 3 }}>
                    Zip
                    <br />
                  </Col>
                  <Col xs={{ span: 5 }}>
                    <Form.Control
                      type="text"
                      value={zip}
                      onChange={(e) => {
                        setZip(e.target.value);
                      }}
                      readOnly
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a valid Zip.
                    </Form.Control.Feedback>
                    {errmessagezip === true ? (
                      <div>
                        <p className="text-danger">enter a valid ZIP code</p>
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </Col>
                </Row>
                <Row className="p-2">
                  <Col xs={{ span: 3 }}>
                    State
                    <br />
                  </Col>
                  <Col xs={{ span: 5 }}>
                    <Form.Control
                      type="text"
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                      }}
                      readOnly
                      required
                    />
                  </Col>
                </Row>
                < br />
          <Row className="p-2">
            <Col xs={{ span: 5 }}>
              <Form.Label>Latitude</Form.Label>
              <Form.Control
                type="text"
                value={latitude}
                readOnly
                required
              />
            </Col>
            <Col xs={{ span: 5 }}>
              <Form.Label>Longitude</Form.Label>
              <Form.Control
                type="text"
                value={longitude}
                readOnly
                required
              />
            </Col>
          </Row>
                <br />
                <Row>
                  <Col>
                    <Button variant="primary" onClick={redirectToProfile}>
                      Go Back
                    </Button>{" "}
                    &nbsp;
                    <Button
                      variant="primary"
                      onClick={(e) => {
                        update(e);
                      }}
                      disabled={(address&&city&&state&&zip&&latitude&&longitude)?false:true}
                    >
                      update personal information
                    </Button>
                  </Col>
                </Row>
              </Form>
              <MyVerticallyCenteredModal
                show={updatesuccess}
                onHide={() => setUpdateSuccess(false)}
              />
            </Container>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default EditPersonalInfo;