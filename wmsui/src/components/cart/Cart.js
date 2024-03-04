import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {Container, Row, Col, Alert, Form} from 'react-bootstrap';
import Select from 'react-select';
import axios from 'axios';

const Cart = () => {

    const [cartMsg, setCartMsg] = useState(false);
    const [cartCheckItems, setCartItems] = useState([]);
    const [totalItemscount, setTotalItemsCount] = useState(0);
    const [finalBill, setFinalBill] = useState(0);
    const [errorMsg, setErrorMsg] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState();
    const [error, setError] = useState(false);
    const [allCustomers, setAllCustomers] = useState(null); // All customers under logged in salesperson
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [menuData, setMenuData] = useState(null); 
    let userName = useSelector((state) => state.loginReducer.userInfo.username);
    const getMenuItems = async () => {
        try {
            let resp = await axios.post(`${process.env.REACT_APP_API_URL}/inventory/getItemsByName`, {
                pageNum: -1,
                searchItem: "",
                searchCategory: "",
                isActive: ""
            });
            setMenuData(resp.data);
            setError(false);
        }
        catch (err) {
            setError(true);
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
                searchSalesperson: userName
            });
            setAllCustomers(resp.data);
            setError(false);
        }
        catch (err) {
            setError(true);
        }
    }
    const options = allCustomers ? allCustomers.map((item) => ({ value: item.id, label: item.customername })) : null;
    const getCartItems = async (value) => {
        try {
            let cartItems = await axios.get(`${process.env.REACT_APP_API_URL}/cart/myitems/${value}`);
            if (cartItems.data && cartItems.data.length > 0) {

                setCartItems(cartItems.data);
                setCartMsg(false);
                handleCheckoutInfo(cartItems.data);

            }
            else {
               // console.log("exec false len <0");
                setCartMsg(true);
            }
        }
        catch (e) {
            console.log(e, "error res");
            setCartMsg(true);
        }
    }
   const handleSelectCustomer = async (value)=>{
            setSelectedCustomer(value);
            getCartItems(value);
        }

    useEffect(() => {
        getAllCustomers();
        getMenuItems();
        return () => {

        };
    }, []);
    const handleCheckoutInfo = (cartItems) => {

        let sumofTotal = 0.00;
        let sumofTotalWithoutOffer=0.00;
        for (let cartItem of cartItems) {
                sumofTotal += Number(cartItem.totalPrice);
                sumofTotalWithoutOffer+=Number(cartItem.totalPrice)
        }
        setTotalItemsCount(cartItems.length);

        setFinalBill(sumofTotal);
    }

    const handleCartIncrement = async (e, cartId) => {
        e.preventDefault();
        try {
            let increaseCartQty = await axios.post(`${process.env.REACT_APP_API_URL}/cart/increaseQty`, { cartId: cartId, userId: selectedCustomer});
            if (increaseCartQty.data.length > 0) {

                setCartItems(increaseCartQty.data);
                setCartMsg(false);
                handleCheckoutInfo(increaseCartQty.data);
            }
        }
        catch (e) {
            setCartMsg(true); //show cart empty
            console.log(e, "error");
        }
    }

    const handleCartDecrement = async (e, cartId) => {
        e.preventDefault();
        try {
            let increaseCartQty = await axios.post(`${process.env.REACT_APP_API_URL}/cart/decreaseQty`, { cartId: cartId, userId: selectedCustomer});
            if (increaseCartQty.data.length > 0) {

                setCartItems(increaseCartQty.data);
                setCartMsg(false);
                handleCheckoutInfo(increaseCartQty.data);
            }
        }
        catch (e) {
            setCartMsg(true); //show cart empty
            console.log(e, "error");

        }
    }

    const handleDeleteItem = async (e, cartId) => {
        e.preventDefault();
        try {
            let deleteCartItem = await axios.delete(`${process.env.REACT_APP_API_URL}/cart/deleteCartItem`, {data:{ cartId: cartId, userId: selectedCustomer}});
            if (deleteCartItem.data.length > 0) {
                setCartItems(deleteCartItem.data);
                setCartMsg(false);
                handleCheckoutInfo(deleteCartItem.data);
            }
        }
        catch (e) {
            setCartMsg(true);
            console.log(e, "delete error");
        }
    }

    const saveCheckoutInfo = async (e) => {

        let checkoutData = {
            userId: selectedCustomer,
            cartItems: cartCheckItems,
            totalBill: finalBill
        }
        //console.log(checkoutData,"chkData");
        try {
            setErrorMsg(false);
            //navigate("/checkout");
            let transactionObj = {
                userId:selectedCustomer,
                transactionTotal: finalBill,
                transactionItems: cartCheckItems,
                transactionType: "",
            }
            //}
            try {
                let transactionProc = await axios.post(`${process.env.REACT_APP_API_URL}/transaction/addtotransaction`,  transactionObj );
             //   console.log(transactionProc.data, "transaction resp");
                setOrderSuccess(true);
            }
            catch (e) {
                setOrderSuccess(false);
                console.log("transaction error", e);
            }
        }
        catch (e) {
            setErrorMsg(true);

        }
    }
    return (<>
    {orderSuccess === true ? 
            <Container className='text-center mt-3'>
                <Row>
                    <Col>
                        <Alert variant='success'>
                            <h3>  Your Order is placed</h3>
                        </Alert>
                    </Col>
                </Row>
            </Container> :  orderSuccess === false ? <Container className='text-center mt-3'>
                <Row>
                    <Col>
                        <Alert variant='danger'>
                            <h4>  Transaction failed. Please try again</h4>
                        </Alert>
                    </Col>
                </Row>
            </Container> : null}
        <div className="card mt-5">
            <div className="container mt-3 mb-3">
            <Row className="menu-center-text mt-3">
                <Form className="mb-3">
                  <Row>
                    <Col className="col-md-4">
                        <Select
                            value={options && options.find((option) => option.value === selectedCustomer)}
                            onChange={(e) => handleSelectCustomer(e.value)}
                            options= {options}
                            isSearchable
                            placeholder="Select a customer"
                          />
                    </Col>
                    <Col>
                    <h3 style={{ textAlign: 'right' }} >Customer Name:{' '} {options? (options.find((option) => option.value === selectedCustomer) || {}).label: ''}</h3>
                    </Col>
                  </Row>
                </Form>
              </Row>
              {selectedCustomer?
                (cartMsg === true ? <h1>Cart is empty</h1> :
                    <div className="row">
                        <div className="col-md-8">
                            <h1 className="text-center"> Cart</h1>
                            {cartCheckItems && cartCheckItems.map(el =>
                                <div key={el.cartId} className="card  mt-2">
                                    <div className="row ">
                                        <div className="col-md-3">
                                            <img height={170} width="100%" src={el.itemImage} alt="abc"></img>
                                        </div>
                                        <div className="col-md-3">
                                            <br></br>
                                            <br></br>
                                            <h6> {el.itemName} </h6>
                                            <p className='d-flex align-items-center'>
                                                {el.itemCategory}
                                            </p>
                                        </div>
                                        <div className="col-lg-2 ">

                                            <br></br>
                                            <br></br>
                                            <h6 className=''> <p>Quantity</p></h6>
                                            <div className="btn-group" role="group">
                                            {el.itemQuantity===(menuData? (menuData.find((data) => data.itemId === el.itemId) || {}).quantity: 0)?null:<button className="btn d-flex align-items-center btn-outline-primary btn-sm" onClick={(e) => { handleCartIncrement(e, el.cartId) }} >+</button>}
                                                &nbsp; {el.itemQuantity} &nbsp;
                                                <button className="btn btn-sm btn-outline-danger d-flex align-items-center" onClick={(e) => { handleCartDecrement(e, el.cartId) }}>-</button>
                                            </div>
                                        </div>
                                        <div className="col-lg-1 d-flex align-items-center">

                                            <span><h6>Price</h6> $&nbsp;{Number(el.itemCartPrice).toFixed(2).toString()}</span>
                                        </div>
                                        <div className="col-lg-2 d-flex align-items-center">

                                            <span><h6>Total</h6> <b>$&nbsp;{Number(el.totalPrice).toFixed(2).toString()}</b></span>
                                        </div>
                                        <div className="col-lg-1 d-flex align-items-center">

                                            <button type="button" className="btn btn-outline-danger" onClick={(e) => { handleDeleteItem(e, el.cartId) }}>X</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="col-md-4">

                            <h3 className="text-center"> Summary</h3>
                            <hr></hr>
                            <div className='row '>
                                <div className='col-md-6 '>
                                    <h3 className=''>ITEMS {"("}{totalItemscount}{")"}</h3>
                                </div>

                            </div>

                            <hr className='mt-5'></hr>
                            <div className='row'>
                                <div className='col'>
                                    <h3>  Total Price : $&nbsp;{Number(finalBill).toFixed(2).toString()} </h3>
                                </div>
                            </div>

                            <div className='row mt-3'>
                                <div className='col'>
                                    <button className='btn btn-primary' disabled={orderSuccess} onClick={(e) => { saveCheckoutInfo(e) }} >SUBMIT ORDER</button>
                                </div>
                            </div>
                        </div>
                    </div>
              ): <h1 style={{ textAlign: 'center' }}>Please select customer to view cart</h1>}
            </div>
            {errorMsg === true ? <div className='container'>
                <div className='row'>
                    <div className='col alert alert-danger'>
                        <h4>Quantity not available</h4>
                    </div>
                </div>
            </div> : null}
            {/* {error === true ? (
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
        ) : null} */}
        </div>
    </>)
}
export default Cart;