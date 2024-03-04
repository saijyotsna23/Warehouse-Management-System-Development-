import React from 'react';
import {Container, Row, Col, Button, Alert, Table, Modal} from 'react-bootstrap';
import axios from "axios";
import { useState, useEffect, useRef} from "react";
import { useSelector } from "react-redux";
import { FaPrint } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';

const ViewOrdersOfCustomers = ({ selectedUserId }) => {
  let userId = selectedUserId;
    const [error, setError] = useState(false);
    const [menuError, setMenuError] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [menuData, setMenuData] = useState(null);
    const [products, setProducts] = useState([]);
    const [allCustomers, setAllCustomers] = useState(null); // All customers under logged in salesperson
    const [showCartModel, setShowCartModel] = useState(false);
    
    let role = "customer";
    const componentPDF = useRef();
    const generatePDF = useReactToPrint({
        content: ()=>componentPDF.current,
        documentTitle: selectedTransaction? allCustomers? (allCustomers.find((item) => item.id === selectedTransaction.userId) || {}).customername || "Order Details": "Order Details": "Order Details",
        onAfterPrint: () => alert("Data saved to PDF")
    });
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
    const getAllCustomers = async () => {
        try {

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

    const getOrderItems = async () => {
        try {
          if(userId==null || userId==""){
            if(localStorage.getItem('user')){
              userId=JSON.parse(localStorage.getItem("user")).userId;
            }}
            if(role==null || role==""){
              if(localStorage.getItem('user')){
                role=JSON.parse(localStorage.getItem("user")).role;
              }}
                setMenuError(true);
                let resp = await axios.post(`${process.env.REACT_APP_API_URL}/transaction/gettransactions`, { userId: (role=="customer"?userId:""), status: (role=="customer"?"":"packed")});
                        
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
        getOrderItems();
    }
    useEffect(
         () => {
             getAllCustomers();
             getOrderItems();
             getAllProducts();
             
        }, []);
    
        return (
          <>
               {selectedTransaction && <Modal size="lg" centered fullscreen={true} show={showCartModel} onHide={(e)=>{
                    setSelectedTransaction(null);
                  setShowCartModel(false);
                  }}>
                    <Modal.Header closeButton>
                      <Modal.Title id="contained-modal-title-vcenter">
                       PRINT ORDER
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
            <Container className="mt-2">
              <Col>
              </Col>
              <Row className="menu-center-text">
                <Col>
                  <h2> {role=="customer"?"ORDERS":"PACKED ORDERS"}</h2>
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
                      <th># of Items</th>
                      <th>Order Total</th>
                      <th>Paid Amount</th>
                      <th>PRINT</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuData &&
                      menuData.map((data, index) => {
                        return (
                          <tr key={index}>
                            <td>{(allCustomers? (allCustomers.find((item) => item.id === data.userId) || {}).customername: '')}</td>
                            <td>{new Date((data.transactionDate).toString()).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', }) }</td>
                            <td>{allCustomers?(allCustomers.find((item) => item.id === data.userId) || {}).salesperson: ""}</td>
                            <td>{(data.transactionItems).length}</td>
                            <td><b>$&nbsp;{Number(data.transactionTotal).toFixed(2).toString()}</b></td>
                            <td><b>$&nbsp;{Number(data.receivedAmount).toFixed(2).toString()}</b></td>
                            <td><Button size='lg' variant='light' onClick={(e) => { handleModel(data);  }}
                            ><FaPrint size={20} color="blue" /> </Button></td>
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
          
          </>
        );
    }
    
    export default ViewOrdersOfCustomers;