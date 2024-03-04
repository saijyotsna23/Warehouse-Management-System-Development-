import React from 'react';
import {Container, Row, Col, Button, Alert, Table, Modal, Form} from 'react-bootstrap';
import axios from "axios";
import { useState, useEffect} from "react";
import { useSelector } from "react-redux";
import { FaMapMarked } from "react-icons/fa";
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

const Accountant = () => {
    
    const [error, setError] = useState(false);
    const [menuError, setMenuError] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [drivers, setDrivers] = useState(null);
    const [confirmPack, setConfirmPack] = useState(false);
    const [menuData, setMenuData] = useState(null);
    const [products, setProducts] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [settleAmount, setSettleAmount] = useState(0);
    const [comments, setComments] = useState(null);
    const [mode, setMode] = useState(null);
    const [allCustomers, setAllCustomers] = useState(null); // All customers under logged in salesperson
    const [showCartModel, setShowCartModel] = useState(false);
    const [showPackModel, setShowPackModel] = useState(false);
    const [directions, setDirections] = useState(null);
    let userName = useSelector((state) => state.loginReducer.userInfo.username);
    let userId = useSelector((state) => state.loginReducer.userInfo.userId);
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_API,
      });
      const mapOptions = {
        zoom: 12,
        center: { lat: 42.6629143, lng: -73.7734688 }, // Default center
      };
      const handleMapData = async(data) =>{
        let filteredLocations=data.driveRoute;
        if (isLoaded) {
            if (filteredLocations.length >= 1) {
          
              setDirections(null);
              let directionsService = new window.google.maps.DirectionsService();
              let origin = new window.google.maps.LatLng(42.6629143, -73.7734688);
              let destination = new window.google.maps.LatLng(filteredLocations[filteredLocations.length - 1].latitude, filteredLocations[filteredLocations.length - 1].longitude);
              let waypoints = [...filteredLocations];
              directionsService.route(
                {
                  origin,
                  destination,
                  waypoints:waypoints.map(location => ({
                      location: new window.google.maps.LatLng(
                          parseFloat(location.latitude),
                          parseFloat(location.longitude)
                      ),
                      stopover: true,
                  })),
                  travelMode: window.google.maps.TravelMode.DRIVING,
                
                },
                (result, status) => {
                  if (status == window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                  } else {
                    console.error(`Error fetching directions: ${status}`);
                  }
                }
              );
           }
          }
      }
    
      const updateItemQuantity = async (e,transac) => {
        e.preventDefault();
        let latesttransac = {
            ...transac,
            transactionStatus: "settled"
          };
        try {
            let resp = await axios.post(`${process.env.REACT_APP_API_URL}/transaction/settleAmount`, { transaction: latesttransac, amount: String(settleAmount)});
            getOrderItems();
        }
        catch (err) {
            console.log(err);
            getOrderItems();

        }
        
      };
    const getAllProducts = async () => {
        try {
            let resp = await axios.post(`${process.env.REACT_APP_API_URL}/inventory/getItemsByName`, {
                pageNum: -1,
                searchItem: "",
                searchCategory: "",
                isActive: ""
            });
            setProducts(resp.data);
        }
        catch (err) {
            console.log(err);
        }
    }
    const getAllCustomers = async () => {
        try {
            if(userName==null || userName==""){
                if(localStorage.getItem('user')){
                     userName=JSON.parse(localStorage.getItem("user")).username;
                }}

            let resp = await axios.post(`${process.env.REACT_APP_API_URL}/customers/getCustomersByName`, {
                pageNum: -1,
                searchCustomer: "",
                searchSalesperson: ""
            });
            setAllCustomers(resp.data);
         
        }
        catch (err) {
            console.log(err,"Error in retrieving orders");
        }
    }
    const getAllDrivers = async () => {
      try {
          let resp = await axios.get(`${process.env.REACT_APP_API_URL}/customers/getAllDrivers`);
          setDrivers(resp.data);
          
      }
      catch (err) {
          console.log("Error in getting drivers"+err);
      }
  }

    const getOrderItems = async () => {
        try {
            if(userId==null || userId==""){
                if(localStorage.getItem('user')){
                    userId=JSON.parse(localStorage.getItem("user")).userId;
                }}
                setMenuError(true);
                let resp = await axios.post(`${process.env.REACT_APP_API_URL}/transaction/gettransactionsfordriver`, { driver: "", status: "delivered"});
                        
                    if (resp.data.length > 0) {
                        setMenuData(resp.data);
                        setMenuError(false);
                        setError(false);
                       
                    }
                    else {
                        setError(true);
                    }
            }
            catch (err) {
                setError(true);
    
            }
      }

    const handleModel = async (items) =>{
        setSelectedTransaction(items);
        setShowCartModel(true);
        getOrderItems()
    }
    const handlePackModel = async (items) =>{
        setSelectedTransaction(items);
        setShowPackModel(true);
       getOrderItems()
    }
    useEffect(
         () => {
             getAllCustomers();
             getOrderItems();
             getAllProducts();
             getAllDrivers();
        }, []);
    
        return (
          <>
               {selectedTransaction && <Modal size="lg" centered fullscreen={true} show={showCartModel} onHide={(e)=>{
                    setSelectedTransaction(null);
                    setDirections(null);
                  setShowCartModel(false);
                  }}>
                    <Modal.Header closeButton>
                      <Modal.Title id="contained-modal-title-vcenter">
                       ROUTE
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                     
                      {isLoaded?<GoogleMap
                        mapContainerStyle={{ height: '850px', width: '100%' }}
                        options={mapOptions}
                    >
                       
                        {directions && (
                        <DirectionsRenderer
                            
                            directions={directions}
                            options={{
                            polylineOptions: {
                                strokeColor: '#DF160A', // Change the color of the route
                            },
                            }}
                        />
                        )}
                    </GoogleMap>: null}
                     
                    </Modal.Body>
                    <Modal.Footer>
                      <Button onClick={(e)=>{
                        setSelectedTransaction(null);
                        setDirections(null);
                        setShowCartModel(false);
                  }}>Close</Button>
                    </Modal.Footer>
                </Modal> }
                {selectedTransaction && <Modal size="lg" centered show={showPackModel} onHide={(e)=>{
                 
                    setSelectedTransaction(null);
                  setShowPackModel(false);
                  setConfirmPack(false);
                  window.location.reload();
                  }}>
                    <Modal.Header closeButton>
                      <Modal.Title id="contained-modal-title-vcenter">
                       DELIVER
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Container>
                        <div>
                           <p><b>Order ID:</b>&nbsp;&nbsp;{selectedTransaction.transactionId}</p>
                           <p><b>Date: </b>&nbsp;&nbsp;{ new Date((selectedTransaction.transactionDate).toString()).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',  hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true})}</p>
                           <p><b>Customer:</b>&nbsp;&nbsp;{(allCustomers? (allCustomers.find((item) => item.id === selectedTransaction.userId) || {}).customername: '')}</p>
                           <p><b>STATUS:</b>&nbsp;&nbsp;{(selectedTransaction.transactionStatus==="ordered"?'NEW':selectedTransaction.transactionStatus)}</p>
                           <p><b># of Items:</b>&nbsp;{(selectedTransaction.transactionItems).length}</p>
                           <p><b>Total:$&nbsp;{Number(selectedTransaction.transactionTotal).toFixed(2).toString()}</b></p>
                           <p><b>Amount Received:$&nbsp;{Number(selectedTransaction.receivedAmount).toFixed(2).toString()}</b></p>
                           <p><b>Due Amount: $&nbsp;{Number(allCustomers? (allCustomers.find((item) => item.id == selectedTransaction.userId) || {}).dueamount: 0).toFixed(2).toString()}</b></p>
                           <hr />
                           <p>Comments: {selectedTransaction.comments}</p>
                           <hr />
                           <Form>
                               
                                <Form.Group as={Row} className="mb-3">
                                <Col lg={{ span: 3, offset: 3 }}>
                                    <Form.Label>Settle Amount</Form.Label>
                                </Col>
                                <Col lg={{ span: 5 }}>
                                    <Form.Control
                                    type="Number"
                                    value={settleAmount}
                                    onChange={(e) => {
                                        setSettleAmount(e.target.value);
                                        setConfirmPack(false);
                                    }}
                                    disabled={Number(selectedTransaction.receivedAmount)==0}
                                    required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                    Amount is required.
                                    </Form.Control.Feedback>
                                </Col>
                                </Form.Group>
                <br />
                {confirmPack==true?null:<Button variant='success' onClick={(e)=>{setConfirmPack(true)}}>SETTLE</Button>}
                &nbsp;&nbsp;
                        {confirmPack==true?<><p>Are you Sure?</p><Button variant='danger' type="submit" onClick={async(e)=>{await updateItemQuantity(e,selectedTransaction);setSelectedTransaction(null);setShowPackModel(false);setConfirmPack(false);window.location.reload()}}>YES</Button></>:null}
                        &nbsp;&nbsp;
                        {confirmPack==true?<Button variant='success' onClick={(e)=>{setConfirmPack(false)}}>No</Button>:null}
                        &nbsp;&nbsp;
                      <Button onClick={(e)=>{
                        setSelectedTransaction(null);
                        setShowPackModel(false);
                        window.location.reload()
                  }}>Close</Button>
              </Form>
                        </div>

                      </Container>
                    </Modal.Body>
                    <Modal.Footer>
                        
                    </Modal.Footer>
                </Modal> }
            <Container className="mt-2">
              <Col>
              </Col>
              <Row className="menu-center-text">
                <Col>
                  <h2>ORDERS</h2>
                </Col>
              </Row>
            </Container>
            <hr />
        

        <Container className="mt-3">
          <Row>
            {menuData && menuData.length > 0 ? (
              <Container>
                <Table>
                  <thead>
                    <tr>
                    <th>Customer</th>
                      <th>Ordered Date</th>
                      <th>Salesperson</th>
                      <th>Driver</th>
                      <th># of Items</th>
                      <th>TOTAL</th>
                      <th>Status</th>
                      <th>ACTION</th>
                      
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCustomers&& menuData &&
                      menuData.map((data, index) => {
                        return (
                          <tr key={index}>
                            <td>{(allCustomers? (allCustomers.find((item) => item.id === data.userId) || {}).customername: '')}</td>
                            <td>{new Date((data.transactionDate).toString()).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', }) }</td>
                            <td>{allCustomers?(allCustomers.find((item,u) => item.id == data.userId) || {}).salesperson: ""}</td>
                            <td>
                                  {drivers
                                    ? ((drivers.find((item) => item.id === data.driver) || {}).fname || "") + " " + ((drivers.find((item) => item.id === data.driver) || {}).lname || "")
                                    : ""}
                                   
                                </td>
                            <td>{(data.transactionItems).length}</td>
                            <td><b>$&nbsp;{Number(data.transactionTotal).toFixed(2).toString()}</b></td>
                            <td>{data.paymentStatus}</td>
                            <td><Button variant='success' onClick={(e) => { handlePackModel(data);  }}
                            >SETTLE</Button></td>
                          </tr>
                        );
                      })}
                  </tbody>
                </Table>
              </Container>
            ) : menuError !== true ? (
              <Container>
                <Row>
                  <Col>
                    <h2>LOADING ...</h2>
                  </Col>
                </Row>
              </Container>
            ) : null}
          </Row>
        </Container>
        {error === true ? (
          <Container>
            <Row>
              <Col>
                <Alert variant="danger">
                  <Alert.Heading>No New orders available currently</Alert.Heading>
                </Alert>
              </Col>
            </Row>
          </Container>
        ) : null}
          
          </>
        );
    }
    
    export default Accountant;