import React from 'react';
import {Container, Row, Col, Pagination, Form, Button, Alert, Table} from 'react-bootstrap';
import axios from "axios";
import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ViewOrdersOfCustomers from "../viewOrdersOfCustomers/ViewOrdersOfCustomers";


const ViewCustomer = () => {
    const [activePage, setActivePage] = useState(0);
    const [error, setError] = useState(false);
    const [searchCustomer, setSearchCustomer] = useState("");
    const [searchSalesperson, setSearchSalesperson] = useState("");
    const [pagesNum, setPagesNum] = useState(0);
    const [allCustomers, setAllCustomers] = useState(null);
    const [allSalespersons, setAllSalespersons] = useState(null);  
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    let userRole = useSelector((state) => state.loginReducer.userInfo.role);
    let userName = useSelector((state) => state.loginReducer.userInfo.userName);

    const getAllCustomers = async () => {
        try {
          setError(false);
          if(userName==null || userName==""){
            if(localStorage.getItem('user')){
                userName=JSON.parse(localStorage.getItem("user")).username;
            }}
            if(userRole==null || userRole==""){
              if(localStorage.getItem('user')){
                userRole=JSON.parse(localStorage.getItem("user")).role;
              }}
          console.log(userName);
            let resp = await axios.post(`${process.env.REACT_APP_API_URL}/customers/getCustomersByName`, {
                pageNum: activePage,
                searchCustomer: searchCustomer,
                searchSalesperson: userRole=="sales person"?userName: ""
            });
            setAllCustomers(resp.data);
            console.log((resp.data)[3].id,"DDDDDD");
            setError(false);
            if(!resp.data)
            {setError(true)}
        }
        catch (err) {
            console.log(err);
        }
    }
    const getAllSalespersons = async () => {
      try {
          let resp = await axios.get(`${process.env.REACT_APP_API_URL}/customers/getAllSalespersons`);
          setAllSalespersons(resp.data);
      }
      catch (err) {
          console.log("Error in getting salespersons"+err);
      }
  }

    useEffect(
        () => {
          {userRole=="sales person"?setSearchSalesperson(userName): getAllSalespersons()};
          setAllCustomers(null);
            getPagesCount();
            getAllCustomers();

        }, [activePage]);

    const getPagesCount = async () => {
        try {
            let countRes = await axios.post(`${process.env.REACT_APP_API_URL}/customers/itemCount`,{searchSalesperson: searchSalesperson, searchCustomer: searchCustomer});
            setPagesNum(countRes.data.count);
        } catch (e) {
            setPagesNum(0);
        }
    }

    const retreiveItems = (e) => {
        e.preventDefault();
        setIsLoading(true);
        getPagesCount();
        setActivePage(0);
        setAllCustomers([]);
        if(userName==null || userName==""){
          if(localStorage.getItem('user')){
              userName=JSON.parse(localStorage.getItem("user")).username;
          }}
        axios.post(`${process.env.REACT_APP_API_URL}/customers/getCustomersByName`, {
            pageNum: activePage,
            searchCustomer: searchCustomer,
            searchSalesperson: userRole=="sales person"?userName: searchSalesperson
        })
            .then(results => {
              setAllCustomers(results.data);
                setError(false);
                setIsLoading(false);
            }
            )
            .catch(e => {
                setError(true);
                setIsLoading(false);
                // setSearchItem("");
            })

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
      selectedUserId==null?
      <>
        <Container className="mt-2">

          <Col>
          </Col>
          <Row className="menu-center-text">
            <Col>
              <h2> Customers List </h2>
            </Col>
          </Row>
          <Row className="menu-center-text mt-3">
            <Form className="mb-3" onSubmit={(e) => {
                retreiveItems(e);
              }}>
              <Row>
                {userRole=="sales person"?
                null:
                <Col className="col-md-4">
                  <Form.Select
                    aria-label="Category"
                    value={searchSalesperson}
                    onChange={(e) => {
                      setSearchSalesperson(e.target.value);
                    }}
                  >
                    <option value="">All Sales persons</option>
                   {allSalespersons && allSalespersons.map((data, index) => (
                        <option key={index} value={data.username}>{data.fname+" "+data.lname}</option>
                        ))}
                  </Form.Select>
                </Col>}
                <Col className="col-md-4">
                  <Form.Control
                    value={searchCustomer}
                    onChange={(e) => {
                      setSearchCustomer(e.target.value);
                    }}
                    id="search-name"
                    placeholder="Search customer by store name"
                  />
                </Col>

                <Col className="col-md-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Loading..." : "Search"}
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
            {allCustomers && allCustomers.length > 0 ? (
              <Container>
                <Table>
                  <thead>
                    <tr>
                      <th>Store Name</th>
                      <th>Type</th>
                      <th>Owner</th>
                      <th>Assigned sales person</th>
                      <th>Due Amount</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCustomers &&
                      allCustomers.map((data, index) => {
                        return (
                          <tr key={index}>
                            <td>
                            <Link onClick={(e) => {setSelectedUserId(data.id); console.log(data.id,"DATATATATA")}}>
                                  <b>{data.customername}</b>
                                </Link>
                            </td>
                            <td>{data.customertype}</td>
                            <td>{data.fname+" "+data.lname}</td>
                            <td>{data.salesperson}</td>
                            <td style={{'width':'10%'}}><p style={data.dueamount>0?{'backgroundColor': 'red', 'color': 'white'}:{}}>{"$ "+Number(data.dueamount).toFixed(2).toString()}</p></td>
                            <td>{data.address+" "+data.city+" "+data.state+" "+data.zip}</td>
                       
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
      </>:  <ViewOrdersOfCustomers selectedUserId={selectedUserId} />
    );
}

export default ViewCustomer;