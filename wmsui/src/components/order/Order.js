import React from 'react';
import {Container, Row, Col, Pagination, Card, Form, Button, Alert, Table, Modal} from 'react-bootstrap';
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Select from 'react-select';
import { useNavigate } from "react-router-dom";
import { increaseCartCount} from '../../redux-part/reducers/loginReducer';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import Cart from "../cart/Cart";

const Order = () => {
    const [activePage, setActivePage] = useState(0);
    const [error, setError] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [cartSuccess, setCartSuccess] = useState(true);
    const [menuData, setMenuData] = useState(null);  
    const [searchCategory, setSearchCategory] = useState("");
    const [searchItem, setSearchItem] = useState("");
    const [pagesNum, setPagesNum] = useState(0);
    const [allCustomers, setAllCustomers] = useState(null); // All customers under logged in salesperson
    const [isLoading, setIsLoading] = useState(false);
    const [showCartModel, setShowCartModel] = useState(false);
    let userName = useSelector((state) => state.loginReducer.userInfo.username);
    const [cartLength, setCartLength] = useState(0);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const getAllCustomers = async () => {
        try {
            if(userName==null || userName==""){
                if(localStorage.getItem('user')){
                     userName=JSON.parse(localStorage.getItem("user")).username;
                }}

            let resp = await axios.post(`${process.env.REACT_APP_API_URL}/customers/getCustomersByName`, {
                pageNum: -1,
                searchCustomer: "",
                searchSalesperson: userName
            });
            setAllCustomers(resp.data);
            setError(false);
            setCartSuccess(true);
        }
        catch (err) {
            setError(true);
            setCartSuccess(true);
        }
    }
    const getCartItems = async (value) => {
      try {
          let cartItems = await axios.get(`${process.env.REACT_APP_API_URL}/cart/myitems/${value}`);
         
          if (cartItems.data && cartItems.data.length > 0) {

              setCartLength((cartItems.data).length);

          }
          setCartSuccess(true);
      }
      catch (e) {
          console.log(e, "error res");
          setCartLength(0);
      }
  }

  const handleSelectCustomer = async (value)=>{
    setSelectedCustomer(value);
    let temp=(allCustomers? (allCustomers.find((data) => data.username === value) || {}).id: '');
    getCartItems(temp);
}

    const options = allCustomers ? allCustomers.map((item) => ({ value: item.username, label: item.customername })) : null;
    const getAllItems = () => {
      setIsLoading(true);
      getPagesCount();
      setMenuData([]);
      axios.post(`${process.env.REACT_APP_API_URL}/inventory/getItemsByName`, {
          pageNum: activePage,
          searchItem: searchItem,
          searchCategory: searchCategory,
          isActive: "1"
      })
          .then(results => {
              setMenuData(results.data);
              setError(false);
              setIsLoading(false);
              setCartSuccess(true);
          }
          )
          .catch(e => {
              setError(true);
              setIsLoading(false);
              setCartSuccess(true);
              // setSearchItem("");
          })

  }
    useEffect(
         () => {
            getPagesCount();
             getAllCustomers();
             getAllItems();
        }, [activePage]);

        const getPagesCount = async () => {
            try {
                let countRes = await axios.post(`${process.env.REACT_APP_API_URL}/inventory/itemCount`,{searchCategory: searchCategory, searchItem: searchItem, isActive: "1"});
                setPagesNum(countRes.data.count);
            } catch (e) {
                setPagesNum(0);
            }
        }
    
        const retreiveItems = () => {
            setIsLoading(true);
            getPagesCount();
            setActivePage(0);
            setMenuData([]);
            axios.post(`${process.env.REACT_APP_API_URL}/inventory/getItemsByName`, {
                pageNum: activePage,
                searchItem: searchItem,
                searchCategory: searchCategory,
                isActive: "1"
            })
                .then(results => {
                    setMenuData(results.data);
                    setError(false);
                    setIsLoading(false);
                    setCartSuccess(true);
                }
                )
                .catch(e => {
                    setError(true);
                    setIsLoading(false);
                    setCartSuccess(true);
                    // setSearchItem("");
                })
    
        }
        
        const handleAddTocart = async (e, reqObj) => {
          
                setCartSuccess(true);
                let temp=(allCustomers? (allCustomers.find((data) => data.username === selectedCustomer) || {}).id: '');
                let reqobj = { userId: temp, itemId: reqObj.itemId, itemCartPrice: reqObj.itemCartPrice }
                try {
                    let isAddedtoCart = await axios.post(`${process.env.REACT_APP_API_URL}/cart/addtocart`, reqobj, {
                        headers: { "Content-Type": "application/json" }
                    })
                    if (isAddedtoCart) {
                        e.target.innerText = "Added to cart";
                        setCartSuccess(true);
                    }
                    let temp=(allCustomers? (allCustomers.find((data) => data.username === selectedCustomer) || {}).id: '');
                    getCartItems(temp);
                }
                catch (e) {
                    console.log(e);
                    setCartSuccess(false);
                }
            
            dispatch(increaseCartCount(1));
        }
    
        const getThatPage = (number) => {
          //  console.log(parseInt(number.target.innerText));
            let pageNo = parseInt(number.target.innerText);
            setActivePage(pageNo);
        }
        let items = [];
        for (let number = 0; number <= pagesNum - 1; number++) {
            items.push(
                <Pagination.Item key={number} onClick={(e) => { getThatPage(e) }} active={number === activePage}>
                    {number}
                </Pagination.Item>,
            );
        }
    
        return (
          <>
                <Modal size="lg" centered fullscreen={true} show={showCartModel} onHide={(e)=>{
                  setShowCartModel(false);
                  let temp=(allCustomers? (allCustomers.find((data) => data.username === selectedCustomer) || {}).id: '');
                    getCartItems(temp);
                  }}>
                    <Modal.Header closeButton>
                      <Modal.Title id="contained-modal-title-vcenter">
                       CART
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Cart />
                    </Modal.Body>
                    <Modal.Footer>
                      <Button onClick={(e)=>{
                  setShowCartModel(false);
                  let temp=(allCustomers? (allCustomers.find((data) => data.username === selectedCustomer) || {}).id: '');
                    getCartItems(temp);
                    window.location.reload();
                  }}>Close</Button>
                    </Modal.Footer>
          </Modal>
            <Container className="mt-2">
    
              <Col>
              </Col>
              <Row className="menu-center-text">
                <Col>
                  <h2> NEW ORDER</h2>
                </Col>
              </Row>
              <Row className="menu-center-text mt-3">
                <Form className="mb-3" onSubmit={(e) => {
                    retreiveItems(e);
                  }}>
                  <Row>
                    <Col className="col-md-4">
                        <Select
                            value={options && options.find((option) => option.value === selectedCustomer)}
                            onChange={(e) => {handleSelectCustomer(e.value);}}
                            options= {options}
                            isSearchable
                            placeholder="Select a customer"
                          />
                    </Col>
                    <Col>
                    <h3>Customer Name:{' '} {options? (options.find((option) => option.value === selectedCustomer) || {}).label: ''}</h3>
                    </Col>
                  </Row>
                </Form>
              </Row>
            </Container>
            {cartSuccess === false ? <Container className='text-center'>
            <Row>
                <Col>
                    <Alert variant='danger'>
                        <h3>  Product already exists in cart</h3>
                    </Alert>
                </Col>
            </Row>
        </Container> : null}
            <hr />
        <Container className="mt-2">
            <Row>
            <Col style={{ textAlign: 'left' }}>
              <h4> Add Products to order</h4>
            </Col>
          </Row>
          <Row className="menu-center-text mt-3">
            <Form
              className="mb-3"
              
            >
              <Row>
                <Col className="col-md-4">
                  <Form.Select
                    aria-label="Category"
                    value={searchCategory}
                    onChange={(e) => {
                      setSearchCategory(e.target.value);
                    }}
                  >
                    <option value="">All Categories</option>

                    <option value="Automobil">Automobil</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Health and Beauty">Health and Beauty</option>
                    <option value="Household">Household Products</option>
                  </Form.Select>
                </Col>
                <Col className="col-md-4">
                  <Form.Control
                    value={searchItem}
                    onChange={(e) => {
                      setSearchItem(e.target.value);
                    }}
                    id="search-name"
                    placeholder="Search by Name"
                  />
                </Col>

                <Col className="col-md-2">
                  <Button onClick={(e) => { retreiveItems(e); }} disabled={isLoading}>
                    {isLoading ? "Loading..." : "Search"}
                  </Button>
                </Col>
                <Col className="col-md-2">
                 
                    <Button
                    size='lg'
                      onClick={(e) => {
                        setShowCartModel(true);
                      }}
                    >
                      <AiOutlineShoppingCart /> CART{"("}{cartLength}{")"}
                    </Button>
                </Col>
              </Row>
            </Form>
          </Row>
        </Container>
        {error === true ? (
          <Container>
            <Row>
              <Col>
                <Alert variant="danger">
                  <Alert.Heading>NO DATA FOUND</Alert.Heading>
                  <p>There is no data avaiable for your request.</p>
                </Alert>
              </Col>
            </Row>
          </Container>
        ) : null}

        <Container className="mt-3">
          <Row>
            {menuData && menuData.length > 0 ? (
              <Container>
                <Table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>ID</th>
                      <th>Category</th>
                      <th>Measurement</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuData &&
                      menuData.map((data, index) => {
                        return (
                          <tr key={index}>
                            <td width="100">
                              <Card border="info">
                                <div className="bg-image hover-zoom">
                                  <Card.Img
                                    height="70"
                                    variant="top"
                                    src={data.itemImage}
                                  />
                                </div>
                              </Card>
                            </td>
                            <td>{data.itemName}</td>
                            <td>{data.itemProductId}</td>
                            <td>{data.itemCategory}</td>
                            <td>{data.measurement}</td>
                            <td>{data.quantity}</td>
                            <td><b>$&nbsp;{Number(data.price).toFixed(2).toString()}</b></td>
                            <td>
                            <button
                                disabled={selectedCustomer? data.quantity<=0?true:false: true}
                                className="btn btn-info"
                                onClick={(e) => {
                                    handleAddTocart(e, {
                                        itemId: data.itemId,
                                        itemCartPrice: data.price,
                                        itemName: data.itemName
                                    })
                                }}
                            >
                                {"+ ADD"}
                            </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </Table>
              </Container>
            ) : error !== true ? (
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
        <Container className="d-flex justify-content-center">
          <Row>
            <Col>
              <Pagination>{items}</Pagination>
            </Col>
          </Row>
        </Container>
          
          </>
        );
    }
    
    export default Order;