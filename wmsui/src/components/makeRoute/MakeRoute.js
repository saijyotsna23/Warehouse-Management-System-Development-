// old codee
import React from 'react';
import {Container, Row, Col, Button, Alert, Table, Modal, Form} from 'react-bootstrap';
import axios from "axios";
import { useState, useEffect, useRef} from "react";
import { useSelector } from "react-redux";
import { FaPrint } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';


const MakeRoute = () => {
    
    const [dataArray, setDataArray] = useState(Array(0).fill(""));
    const [error, setError] = useState(false);
    const [drivers, setDrivers] = useState(null);
    const [driver, setDriver] = useState(null);
    const [menuError, setMenuError] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [menuData, setMenuData] = useState(null);
    const [selectedData, setSelectedData] = useState([]);
    const [products, setProducts] = useState([]);
    const [allCustomers, setAllCustomers] = useState(null); // All customers under logged in salesperson
    const [showCartModel, setShowCartModel] = useState(false);
    const [showDriver, setShowDriver] = useState(false);
    const [filteredLocations, setFilteredLocations]= useState([]);
    const [directions, setDirections] = useState(null);
    let userName = useSelector((state) => state.loginReducer.userInfo.username);
    const componentPDF = useRef();
    const generatePDF = useReactToPrint({
        content: ()=>componentPDF.current,
        documentTitle: selectedTransaction? allCustomers? (allCustomers.find((item) => item.id === selectedTransaction.userId) || {}).customername || "Order Details": "Order Details": "Order Details",
        onAfterPrint: () => alert("Data saved to PDF")
    });
      const handleInputChange = async (index, value) => {
        setDataArray((prevData) => {
          const newData = [...prevData];
          newData[index] = (newData[index]=="")?value:"";
          return newData;
        });
        setShowDriver(false);
      };
      const handleCheckboxChange = async(isChecked, data) => {
        if (isChecked) {
          setSelectedData((prevSelectedData) => [...prevSelectedData, data]);
        } else {
          setSelectedData((prevSelectedData) =>
            prevSelectedData.filter((item) => item.transactionId !== data.transactionId)
          );
        }
      };
      const mapData = async(e)=>{
            let newData = dataArray.map(item => (item === "") ? null : item).filter(Boolean);
            let mapCustomers = (Array.from(new Set(newData)));
            let floc = allCustomers
            .filter(customer => mapCustomers.includes(customer.id))
            .map(customer => ({
                latitude: Number(customer.latitude),
                longitude: Number(customer.longitude),
            }))
            .sort((a, b) => {
                // Sort first by latitude, then by longitude
                if (a.longitude !== b.longitude) {
                    return a.longitude - b.longitude;
                }
                return a.latitude - b.latitude;
            });
            setFilteredLocations(floc);
      }
      const mapOptions = {
        zoom: 12,
        center: { lat: 42.6629143, lng: -73.7734688 }, // Default center
      };
      const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_API,
      });
      const handleSizeChange = (newSize) => {
        setDataArray((prevData) => {
          return Array(newSize).fill("").map((item, index) => prevData[index] || item);
        });
      };
    const getAllProducts = async () => {
        try {
            let resp = await axios.post(`${process.env.REACT_APP_API_URL}/inventory/getItemsByName`, {
                pageNum: -1,
                searchItem: "",
                searchCategory: "",
                isActive:""
            });
            setProducts(resp.data);
        }
        catch (err) {
            console.log(err);
        }
    }
    const handleSubmit = async () => {
        try {
            const driveRoute = filteredLocations.map((location) => ({
                latitude: location.latitude,
                longitude: location.longitude,
              }));
            const newSelectedData = selectedData.map((transaction) => {
                return {
                    ...transaction,
                    driveRoute: driveRoute,
                    transactionStatus: "out for delivery",
                    driver: driver
                  };
              });
              let resp = await axios.post(`${process.env.REACT_APP_API_URL}/transaction/updateTransactionAfterRouting`, { transaction: newSelectedData});
              if(resp)
              {
                window.location.reload();
              }
            
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
    const options = drivers ? drivers.map((item) => ({ value: item.id, label: (item.fname+ " "+item.lname)})) : null;
    const getOrderItems = async () => {
        try {
                setMenuError(true);
                let resp = await axios.post(`${process.env.REACT_APP_API_URL}/transaction/gettransactions`, { userId: "", status: "packed"});
                        
                    if (resp.data.length > 0) {
                        setMenuData(resp.data);
                        setMenuError(false);
                        setError(false);
                        handleSizeChange((resp.data).length);
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
        getOrderItems();
    }
    useEffect(
         () => {
                    getAllCustomers();
                    getOrderItems();
                    getAllProducts();
                    getAllDrivers();
                if (isLoaded) {
                  if (filteredLocations.length >= 1) {
                
                    setDirections(null);
                    let directionsService = new window.google.maps.DirectionsService();
                    let origin = new window.google.maps.LatLng(42.6629143, -73.7734688);
                    let destination = new window.google.maps.LatLng(filteredLocations[filteredLocations.length - 1].latitude, filteredLocations[filteredLocations.length - 1].longitude);
                    // let waypoints = [...filteredLocations];
                    let waypoints = [...filteredLocations.slice(0, filteredLocations.length - 1)];
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
             
        }, [isLoaded, filteredLocations]);
    
        return (
          <>
               {selectedTransaction && <Modal size="lg" centered fullscreen={true} show={showCartModel} onHide={(e)=>{
                    setSelectedTransaction(null);
                  setShowCartModel(false);
                  }}>
                    <Modal.Header closeButton>
                      <Modal.Title id="contained-modal-title-vcenter">
                       PRINT PACKED ORDER
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Container>
                        <div ref={componentPDF} style={{width: '80%', margin: '40px'}}>
                           <p><b>Order ID:</b>&nbsp;&nbsp;{selectedTransaction.transactionId}</p>
                           <p><b>Date: </b>&nbsp;&nbsp;{ new Date((selectedTransaction.transactionDate).toString()).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',  hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true})}</p>
                           <p><b>Customer:</b>&nbsp;&nbsp;{(allCustomers? (allCustomers.find((item) => item.id === selectedTransaction.userId) || {}).customername: '')}</p>
                           <p><b>STATUS:</b>&nbsp;&nbsp;{(selectedTransaction.transactionStatus==="ordered"?'NEW':selectedTransaction.transactionStatus)}</p>
                           <p><b># of Items:</b>&nbsp;{(selectedTransaction.transactionItems).length}</p>
                           <h4>ORDERED PRODUCTS</h4>
                           {selectedTransaction.transactionItems && (selectedTransaction.transactionItems).length > 0 ? (
                            <Container>
                                <Table>
                                <thead>
                                    <tr>
                                    <th>Product ID</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Quantity</th>
                                    <th>Unit</th>
                                    <th>Price</th>
                                    <th>Total Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedTransaction.transactionItems &&
                                    selectedTransaction.transactionItems.map((data, index) => {
                                        return (
                                        <tr key={index}>
                                            <td>{(products? (products.find((item) => item.itemId === data.itemId) || {}).itemProductId: '')}</td>
                                           <td>{data.itemName}</td>
                                           <td>{data.itemCategory}</td>
                                           <td>{data.itemQuantity}</td>
                                           <td>{(products? (products.find((item) => item.itemId === data.itemId) || {}).measurement: '')}</td>
                                           <td>$&nbsp;{Number(data.itemCartPrice).toFixed(2).toString()}</td>
                                           <td><b>$&nbsp;{Number(data.totalPrice).toFixed(2).toString()}</b></td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                                </Table>
                                <br />
                                <h3 style={{textAlign:'right'}}><b>TOTAL:&nbsp;&nbsp;$&nbsp;{Number(selectedTransaction.transactionTotal).toFixed(2).toString()}</b> </h3>
                            </Container>
                            ) : null}
                        </div>

                      </Container>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='success' onClick={(e)=>generatePDF()}>PRINT</Button>
                      <Button onClick={(e)=>{
                        setSelectedTransaction(null);
                        setShowCartModel(false);
                  }}>Close</Button>
                    </Modal.Footer>
                </Modal> }
       <Row>
        <Col md={6}>       
       <div>
        <Container className="mt-3">
        <Row className="menu-center-text">
                <Col>
                  <h2> MAKE A ROUTE FOR PACKED ORDERS</h2>
                </Col>
              </Row>
              < br />
          <Row>
            {menuData && menuData.length > 0 ? (
              <Container>
                <Table>
                  <thead>
                    <tr>
                    <th>Customer</th>
                      <th>Ordered Date</th>
                      <th>Salesperson</th>
                      <th># of Items</th>
                      <th>PRINT</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuData &&
                      menuData.map((data, index) => {
                        return (
                          <tr key={index}>
                            <td style={{ width: '150px' }}>{(allCustomers? (allCustomers.find((item) => item.id === data.userId) || {}).customername: '')}</td>
                            <td style={{ width: '270px' }}>{new Date((data.transactionDate).toString()).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', }) }</td>
                            <td style={{ width: '70px' }}>{allCustomers?(allCustomers.find((item) => item.id === data.userId) || {}).salesperson: ""}</td>
                            <td style={{ width: '100px' }}>{(data.transactionItems).length}</td>
                            <td  style={{ width: '70px' }}><Button size='lg' variant='light' onClick={(e) => { handleModel(data);  }}
                            ><FaPrint size={20} color="blue" /> </Button></td>
                            <td style={{ width: '50px' }}><input
                                                    key={index}
                                                    type="checkbox"
                                                    disabled={showDriver}
                                                    checked={dataArray[index]==""?false:true}
                                                    onChange={async (e) => {
                                                        await handleInputChange(index, data.userId);
                                                        await handleCheckboxChange(e.target.checked, data);
                                                      }}
                                                    style={{ transform: 'scale(2)' }}
                                                    /></td>
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
                  <Alert.Heading>NO DATA FOUND</Alert.Heading>
                  <p>There is no transaction data available for your request.</p>
                </Alert>
              </Col>
            </Row>
          </Container>
        ) : null}
        </div>
        </Col>
        <Col style={{overflow:'hidden'}}>
        {dataArray.every(item => item == "")?null:
        <>
        <Row style={{width:"800px"}}><Button variant='success' onClick={async (e)=>{await mapData(e); setShowDriver(true)}}>MAKE ROUTE</Button></Row>
        <br />
        {showDriver?<Row>
                
                    {isLoaded?<GoogleMap
                        mapContainerStyle={{ height: '650px', width: '95%' }}
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
               
        </Row>: null}
        <br />
       {showDriver==true?<Row>
        <Col className="col-md-4">
                  <Form.Select
                    aria-label="driver"
                    value={driver}
                    onChange={(e) => {
                      setDriver(e.target.value);
                    }}
                  >
                    <option value="">Select driver</option>
                    {drivers && drivers.map((data, index) => (
                        <option key={index} value={data.id}>{data.fname+" "+data.lname}</option>
                        ))}
                  </Form.Select>
                </Col>
                <Col><Button disabled={driver?false:true} onClick={async(e)=>{await handleSubmit(); }}>Submit</Button></Col>
        </Row>:null}
        </>
        }
        </Col>
        </Row>
          
          </>
        );
    }
    
    export default MakeRoute;