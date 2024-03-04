import React from 'react';
import {Container, Row, Col, Button, Alert, Table, Modal, Form} from 'react-bootstrap';
import axios from "axios";
import { useState, useEffect, useRef} from "react";
import { useSelector } from "react-redux";
import { FaEye } from 'react-icons/fa';
import { FaPrint } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';

const ViewOrderByPacker = () => {
    
    const [error, setError] = useState(false);
    const [menuError, setMenuError] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [confirmPack, setConfirmPack] = useState(false);
    const [menuData, setMenuData] = useState(null);
    const [products, setProducts] = useState([]);
    const [allCustomers, setAllCustomers] = useState(null); // All customers under logged in salesperson
    const [showCartModel, setShowCartModel] = useState(false);
    const [showPackModel, setShowPackModel] = useState(false);
    let userName = useSelector((state) => state.loginReducer.userInfo.username);
    const componentPDF = useRef();
    const generatePDF = useReactToPrint({
        content: ()=>componentPDF.current,
        documentTitle: selectedTransaction? allCustomers? (allCustomers.find((item) => item.id === selectedTransaction.userId) || {}).customername || "Order Details": "Order Details": "Order Details",
        onAfterPrint: () => alert("Data saved to PDF")
    })
    const [dataArray, setDataArray] = useState(Array(0).fill(0));
    const [isInvalid, setIsInvalid] = useState(false);
      const handleInputChange = (index, value) => {
        setDataArray((prevData) => {
          const newData = [...prevData];
          newData[index] = parseInt(value);
          const cond1 = newData.some((val, idx) => val > selectedTransaction.transactionItems[idx].itemQuantity);
          const cond2 = newData.some((val, idx) => val > (products? (products.find((item) => item.itemId == selectedTransaction.transactionItems[idx].itemId) || {}).quantity: 0));
        
          setIsInvalid(cond1 || cond2);
          return newData;
        });
      };
    
      const handleSizeChange = (newSize) => {
        setDataArray((prevData) => {
          return Array(newSize).fill(0).map((item, index) => prevData[index] || item);
        });
      };
      const updateItemQuantity = async (e,transac) => {
        e.preventDefault();
        const updatedTransactionItems = transac.transactionItems.map((item, i) => ({
          ...item,
          itemQuantity: dataArray[i],
          totalPrice: dataArray[i] * item.itemCartPrice
        }));
      
        const totalprice = updatedTransactionItems.reduce((sum, item) => sum + item.totalPrice, 0);
        let latesttransac = {
            ...transac,
            transactionItems: updatedTransactionItems,
            transactionTotal: totalprice,
            transactionStatus: "packed"
          };
        try {
            // console.log(latesttransac,"latesttransac");
            let resp = await axios.post(`${process.env.REACT_APP_API_URL}/transaction/updateTransaction`, { transaction: latesttransac});
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

    const getOrderItems = async () => {
        try {
                setMenuError(true);
                let resp = await axios.post(`${process.env.REACT_APP_API_URL}/transaction/gettransactions`, { userId: "", status: "ordered"});
                        
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
        handleSizeChange((items.transactionItems).length);
        setShowPackModel(true);
       getOrderItems()
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
                       PRINT
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
                                    <th>Product Id</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Quantity</th>
                                    <th>Unit</th>
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
                                        </tr>
                                        );
                                    })}
                                </tbody>
                                </Table>
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
                {selectedTransaction && <Modal size="lg" centered fullscreen={true} show={showPackModel} onHide={(e)=>{
                    handleSizeChange(0);
                    window.location.reload();
                    setSelectedTransaction(null);
                  setShowPackModel(false);
                  setConfirmPack(false);
                  }}>
                    <Modal.Header closeButton>
                      <Modal.Title id="contained-modal-title-vcenter">
                       PACK
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
                           <h4>ORDERED PRODUCTS</h4>
                           {selectedTransaction.transactionItems && (selectedTransaction.transactionItems).length > 0 ? (
                            <Container>
                                <Table>
                                <thead>
                                    <tr>
                                    <th>Product Id</th>
                                    <th>Name</th>
                                    <th>Selling Unit</th>
                                    <th>Asked Quantity</th>
                                    <th>Packed Quantity</th>
                                    
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedTransaction.transactionItems &&
                                    selectedTransaction.transactionItems.map((data, index) => {
                                        return (
                                        <tr key={index}>
                                            <td>{(products? (products.find((item) => item.itemId === data.itemId) || {}).itemProductId: '')}</td>
                                           <td>{data.itemName}</td>
                                           <td>{(products? (products.find((item) => item.itemId === data.itemId) || {}).measurement: '')}</td>
                                           <td>{data.itemQuantity}</td>
                                           <td><Form.Control
                                                    style={{width: "95px"}}
                                                    key={index}
                                                    type="number"
                                                    max={data.itemQuantity}
                                                    min={0}
                                                    value={dataArray[index] || 0}
                                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                                    isInvalid={dataArray[index] > data.itemQuantity ||dataArray[index] > (products? (products.find((item) => item.itemId == data.itemId) || {}).quantity: 0)} 
                                                    />
                                            </td>
                                           
                                        </tr>
                                        );
                                    })}
                                </tbody>
                                </Table>
                            </Container>
                            ) : null}
                        </div>

                      </Container>
                    </Modal.Body>
                    <Modal.Footer>
                        {confirmPack===true?null:<Button disabled={isInvalid} variant='success' onClick={(e)=>{setConfirmPack(true)}}>PACK</Button>}
                        {confirmPack===true?<><p>Are you Sure?</p><Button disabled={isInvalid} variant='danger' onClick={async(e)=>{await updateItemQuantity(e,selectedTransaction);setSelectedTransaction(null);setShowPackModel(false);handleSizeChange(0);setConfirmPack(false);window.location.reload();}}>YES</Button></>:null}

                        {confirmPack===true?<Button variant='success' onClick={(e)=>{setConfirmPack(false)}}>No</Button>:null}
                      <Button onClick={(e)=>{
                        handleSizeChange(0);
                        setSelectedTransaction(null);
                        setShowPackModel(false);
                        window.location.reload()
                  }}>Close</Button>
                    </Modal.Footer>
                </Modal> }
            <Container className="mt-2">
              <Col>
              </Col>
              <Row className="menu-center-text">
                <Col>
                  <h2> NEW ORDERS</h2>
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
                      <th>PRINT</th>
                      <th>ACTION</th>
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
                            <td><Button size='lg' variant='light' onClick={(e) => { handleModel(data);  }}
                            ><FaPrint size={20} color="blue" /> </Button></td>
                            <td><Button size='lg' variant='light' onClick={(e) => { handlePackModel(data);  }}
                            ><FaEye size={30} color="blue" /> </Button></td>
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
    
    export default ViewOrderByPacker;