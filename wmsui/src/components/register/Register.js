import Form from 'react-bootstrap/Form';
import React, { useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row'
import Container from 'react-bootstrap/Container';
import './Register.css';
import axios from "axios";
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
//Reducer
import { useSelector } from 'react-redux';
import { LoadScript, StandaloneSearchBox} from "@react-google-maps/api";

const Register = () => {
  const inputRef=useRef();
  let navigate = useNavigate();
  const [i_d, setI_d] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [state, setState] = useState("");
  const [role, setRole] = useState("");
  const [customername, setCustomerName] = useState("");
  const [customertype, setCustomerType] = useState("");
  const [dueamount, setDueAmount]= useState(0);
  const [salesperson, setSalesperson]= useState("");
  const [errmessage, setErrMessage] = useState(false);
  const [validated, setValidated] = useState(false);
  const [modalShow, setModalShow] = React.useState(false);
  const [errmessagephone, setErrMessagePhone] = useState("");
  const [errmessagezip, setErrMessagezip] = useState("");
  const [show, setShow] = useState(false);
  let userRole = useSelector((state) => state.loginReducer.userInfo.role);
  let userName = useSelector((state) => state.loginReducer.userInfo.username);
  function redirectToLogin() {
    navigate('/login');
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
        onHide={redirectToLogin}
      >
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body>
          <h4>Congratulations account was created successfully</h4>
        </Modal.Body>
        <Modal.Footer>
          <Button type='submit' onClick={(e)=>{window.location.reload()}}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
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
    }
    else if ((zip.length < 5 || zip.length > 6) && String(phone).length !== 10) {
      setErrMessagePhone(true);
      setErrMessagezip(true);
    }
    else if (phone.length !== 10) {
      setErrMessagePhone(true);
      setErrMessagezip(false);
      event.preventDefault();
      event.stopPropagation();
    }
    else if (zip.length < 5 || zip.length > 6) {
      setErrMessagePhone(false);
      setErrMessagezip(true);
      event.preventDefault();
      event.stopPropagation();
    }
    else {
      setErrMessagePhone(false);
      setErrMessagezip(false);

      let regdetails = {
        i_d,
        fname,
        lname,
        dob,
        email,
        phone,
        username,
        password,
        address,
        zip,
        city,
        state,
        role,
        customername,
        customertype,
        dueamount,
        salesperson,
        latitude,
        longitude
      }
      regdetails.password = encryptWithAES(regdetails.password);
      
      axios.post(`${process.env.REACT_APP_API_URL}/registration/insert`, regdetails).then(
        res => {
          setErrMessage(false);
          setShow(true);
        }
      ).catch(err => {
        console.log(err);
        setErrMessage(true);
      })
    }
    setValidated(true);
  };

  const handleRoleChange = (ROLE) => {
    if(ROLE=="customer")
      {
        setRole(ROLE);
        setSalesperson(userName);
      }
    else{
      setRole(ROLE);
      setSalesperson("");
    }
  }
  

  return (
    <>
      <Container className="register-center-items mt-3">
        <h3 style={{ color: "red" }} className="mb-2">
          Please fill the Form to register the user
        </h3>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          {errmessage === true ? (
            <div>
              <Alert variant="danger">user already exist</Alert>
            </div>
          ) : (
            <div></div>
          )}

          <Form.Group as={Row} className="mb-3">
            <Col lg={{ span: 1, offset: 4 }} sm={12} md={6}>
              <Form.Label>First Name</Form.Label>
            </Col>
            <Col lg={{ span: 3 }} sm={12} md={6}>
              <Form.Control
                type="text"
                value={fname}
                onChange={(e) => {
                  setFname(e.target.value);
                }}
                required
              />
              <Form.Control.Feedback type="invalid">
                First Name is required.
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group
            as={Row}
            className="mb-3"
            controlId="formHorizontalLastName"
          >
            <Col lg={{ span: 1, offset: 4 }} sm={12} md={6}>
              <Form.Label>Last Name</Form.Label>
            </Col>
            <Col lg={{ span: 3 }} sm={12} md={6}>
              <Form.Control
                type="text"
                value={lname}
                onChange={(e) => {
                  setLname(e.target.value);
                }}
                required
              />
              <Form.Control.Feedback type="invalid">
                Last Name is required.
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="formI_d">
            <Col lg={{ span: 1, offset: 4 }} sm={12} md={6}>
              <Form.Label>ID</Form.Label>
            </Col>
            <Col lg={{ span: 3 }} sm={12} md={6}>
              <Form.Control
                type="text"
                placeholder={
                  userRole === "sales person" ? "TAX ID" : "Driver License"
                }
                value={i_d}
                onChange={(e) => {
                  setI_d(e.target.value);
                }}
                required
              />
              <Form.Control.Feedback type="invalid">
                ID required.
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group
            as={Row}
            className="mb-3"
            controlId="formHorizontaldateofbirth"
          >
            <Col lg={{ span: 1, offset: 4 }} sm={12} md={6}>
              <Form.Label>Date Of Birth</Form.Label>
            </Col>
            <Col lg={{ span: 3 }} sm={12} md={6}>
              <Form.Control
                type="date"
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value);
                }}
                required
              />
              <Form.Control.Feedback type="invalid">
                DOB is required.
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
            <Col lg={{ span: 1, offset: 4 }} sm={12} md={6}>
              <Form.Label>Email</Form.Label>
            </Col>
            <Col lg={{ span: 3 }} sm={12} md={6}>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid email address.
              </Form.Control.Feedback>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formHorizontalPhone">
            <Col lg={{ span: 1, offset: 4 }} sm={12} md={6}>
              <Form.Label>Phone</Form.Label>
            </Col>
            <Col lg={{ span: 3 }} sm={12} md={6}>
              <Form.Control
                type="number"
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
                  <p class="text-danger">phone number must be 10 digits</p>
                </div>
              ) : (
                <div></div>
              )}
            </Col>
          </Form.Group>
          <Form.Group
            as={Row}
            className="mb-3"
            controlId="formHorizontalUsername"
          >
            <Col lg={{ span: 1, offset: 4 }} sm={12} md={6}>
              <Form.Label>Username</Form.Label>
            </Col>
            <Col lg={{ span: 3 }} sm={12} md={6}>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                required
              />
            </Col>
          </Form.Group>

          <Form.Group
            as={Row}
            className="mb-3"
            controlId="formHorizontalPassword"
          >
            <Col lg={{ span: 1, offset: 4 }} sm={12} md={6}>
              <Form.Label>Password</Form.Label>
            </Col>
            <Col lg={{ span: 3 }} sm={12} md={6}>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                required
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="formRole">
            <Col lg={{ span: 1, offset: 4 }} sm={12} md={6}>
              <Form.Label>Role</Form.Label>
            </Col>
            <Col lg={{ span: 3 }} sm={12} md={6}>
              <Form.Select
                aria-label="Roles"
                value={role}
                onChange={(e) => {
                  handleRoleChange(e.target.value);
                }}
                required
              >
                <option value="">Select Role</option>
                <option
                  disabled={userRole == "manager" ? false : true}
                  value="sales person"
                >
                  Sales Person
                </option>
                <option
                  disabled={userRole == "manager" ? false : true}
                  value="driver"
                >
                  Driver
                </option>
                <option
                  disabled={userRole == "manager" ? false : true}
                  value="accountant"
                >
                  Accountant
                </option>
                <option
                  disabled={userRole == "manager" ? false : true}
                  value="packer"
                >
                  Packer
                </option>
                <option
                  disabled={userRole == "manager" ? true : false}
                  value="customer"
                >
                  Customer
                </option>
              </Form.Select>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formRole">
            <Col lg={{ span: 1, offset: 4 }} sm={12} md={6}>
              <Form.Label>Address</Form.Label>
            </Col>
            <Col lg={{ span: 3 }} sm={12} md={6}>
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
          </Form.Group>
          {role === "customer" ? (
            <div>
              <Form.Group
                as={Row}
                className="mb-3"
                controlId="formHorizontalCustomerName"
              >
                <Col lg={{ span: 1, offset: 4 }} sm={12} md={6}>
                  <Form.Label>Store Name</Form.Label>
                </Col>
                <Col lg={{ span: 3 }} sm={12} md={6}>
                  <Form.Control
                    type="text"
                    value={customername}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                    }}
                    required
                  />
                </Col>
              </Form.Group>
              <Form.Group
                as={Row}
                className="mb-3"
                controlId="formHorizontalCustomerType"
              >
                <Col lg={{ span: 1, offset: 4 }} sm={12} md={6}>
                  <Form.Label>Customer Type</Form.Label>
                </Col>
                <Col lg={{ span: 3 }} sm={12} md={6}>
                  <Form.Select
                    aria-label="types"
                    value={customertype}
                    onChange={(e) => {
                      setCustomerType(e.target.value);
                    }}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                  </Form.Select>
                </Col>
              </Form.Group>
              <Form.Group
                as={Row}
                className="mb-3"
                controlId="formHorizontalCustomerName"
              >
                <Col lg={{ span: 1, offset: 4 }} sm={12} md={6}>
                  <Form.Label>Sales person</Form.Label>
                </Col>
                <Col lg={{ span: 3 }} sm={12} md={6}>
                  <Form.Control
                    readOnly
                    type="text"
                    value={salesperson}
                    onChange={(e) => {
                      setSalesperson(e.target.value);
                    }}
                  />
                </Col>
              </Form.Group>
            </div>
          ) : null}

          <Row className="mb-3">
            <Form.Group
              as={Col}
              controlId="validationCustom06"
              lg={{ span: 3, offset: 4 }}
              sm={12}
              md={6}
            >
              <Form.Label>Address</Form.Label>
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
            </Form.Group>

            <Form.Group
              as={Col}
              controlId="validationCustom03"
              lg={{ span: 1 }}
              sm={12}
              md={6}
            >
              <Form.Label>Zip</Form.Label>
              <Form.Control
                type="number"
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
                  <p class="text-danger">Enter a valid ZIP code</p>
                </div>
              ) : (
                <div></div>
              )}
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group
              as={Col}
              controlId="validationCustom05"
              lg={{ span: 2, offset: 4 }}
              sm={12}
              md={6}
            >
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                }}
                readOnly
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid city.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group
              as={Col}
              controlId="validationCustom04"
              lg={{ span: 2 }}
              sm={12}
              md={6}
            >
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                }}
                readOnly
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid state.
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group
              as={Col}
              lg={{ span: 2, offset: 4 }}
              sm={12}
              md={6}
            >
              <Form.Label>Latitude</Form.Label>
              <Form.Control
                type="text"
                value={latitude}
                readOnly
                required
              />
            </Form.Group>
            <Form.Group
              as={Col}
              lg={{ span: 2 }}
              sm={12}
              md={6}
            >
              <Form.Label>Longitude</Form.Label>
              <Form.Control
                type="text"
                value={longitude}
                readOnly
                required
              />
            </Form.Group>
          </Row>
          <Button disabled={(address&&city&&state&&zip&&latitude&&longitude)?false:true} type="submit">Register</Button>
          <MyVerticallyCenteredModal
            show={show}
            onHide={() => setModalShow(false)}
          />
        </Form>
      </Container>
    </>
  );
}

export default Register;