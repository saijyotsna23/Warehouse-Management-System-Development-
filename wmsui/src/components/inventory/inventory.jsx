import React from 'react';
import Container from 'react-bootstrap/Container';
import {Row, Col, Pagination, Card, Form, Button, Modal, Alert, Table} from 'react-bootstrap';
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';

const Inventory = () => {
    const [activePage, setActivePage] = useState(0);
    const [error, setError] = useState(false);
    const [searchItem, setSearchItem] = useState("");
    const [searchCategory, setSearchCategory] = useState("");
    const [pagesNum, setPagesNum] = useState(0);
    const [menuData, setMenuData] = useState(null);  
    const [isLoading, setIsLoading] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [itemId, setItemId] = useState("");
    const [itemName, setItemName] = useState("");
    const [itemProductId, setItemProductId] = useState("");
    const [itemCategory, setItemCategory] = useState("");
    const [measurement, setMeasurement] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [itemImage, setItemImage] = useState("");
    const [price, setPrice] = useState(0);
    const [errorMsg,setErrorMsg] = useState(false);
    const [successMessageUp,setSuccessMsgUp] = useState(false);
    let userRole = useSelector((state) => state.loginReducer.userInfo.role);
    let navigate = useNavigate();

    const handleCloseUpdate = () => 
    {
      setShowUpdate(false);
    };
    const handleCloseDelete = () => 
    {
      setShowDelete(false);
    };
    const handleShowUpdate = () => setShowUpdate(true);
    const handleShowDelete = () => setShowDelete(true);
    const getMenuItems = async () => {
        try {
            let resp = await axios.post(`${process.env.REACT_APP_API_URL}/inventory/getItemsByName`, {
                pageNum: activePage,
                searchItem: searchItem,
                searchCategory: searchCategory,
                isActive: "1"
            });
            setMenuData(resp.data);
            setError(false);
        }
        catch (err) {
            setError(true);
        }
    }

    useEffect(
        () => {
            setMenuData(null);
            
            getPagesCount();
            getMenuItems();

        }, [activePage]);
        const updateItem = async(e) => {
            e.preventDefault();
            var formData = {
                itemId: itemId,
                itemName: itemName,
                itemProductId: itemProductId,
                itemCategory: itemCategory,
                measurement: measurement,
                quantity: quantity,
                itemImage: itemImage,
                price:  price.toString()
            };
      
            axios.post(`${process.env.REACT_APP_API_URL}/inventory/updateitem`, formData, {
              headers: { "Content-Type": "application/json" }
            }).then(
              res => {
                    getMenuItems();
                    setSuccessMsgUp(true);
              }
            ).catch(err => {
                setErrorMsg(true);
            })
        }
        const deleteItem = async(e) => {
          e.preventDefault();
          var formData = {
              itemId: itemId
          };
    
          axios.post(`${process.env.REACT_APP_API_URL}/inventory/deleteitem`, formData, {
            headers: { "Content-Type": "application/json" }
          }).then(
            res => {
                  getMenuItems();
                  setSuccessMsgUp(true);
            }
          ).catch(err => {
              setErrorMsg(true);
          })
      }

    const getPagesCount = async () => {
        try {
            let countRes = await axios.post(`${process.env.REACT_APP_API_URL}/inventory/itemCount`,{searchCategory: searchCategory, searchItem: searchItem, isActive: "1"});
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
        let pageNo = (number.target.innerText);
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
        <Container className="mt-2">
          <Modal
            centered
            size="xl"
            show={showUpdate}
            onHide={() => handleCloseUpdate()}
          >
            <Modal.Header closeButton>
              <Modal.Title>Update stock</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group as={Row}>
                  <Col lg={{ span: 3, offset: 3 }}>
                    <Form.Label>Product Name</Form.Label>
                  </Col>
                  <Col lg={{ span: 5 }}>
                    <Form.Control
                      type="text"
                      value={itemName}
                      onChange={(e) => {
                        setItemName(e.target.value);
                      }}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Product name is required.
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>
                <br />
                <Form.Group as={Row} className="mb-3">
                  <Col lg={{ span: 3, offset: 3 }}>
                    <Form.Label>Product ID</Form.Label>
                  </Col>
                  <Col lg={{ span: 5 }}>
                    <Form.Control
                      type="text"
                      value={itemProductId}
                      onChange={(e) => {
                        setItemProductId(e.target.value);
                      }}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Product ID is required.
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>
                <br />
                <Form.Group as={Row} className="mb-3">
                  <Col lg={{ span: 3, offset: 3 }}>
                    <Form.Label>Product Category</Form.Label>
                  </Col>
                  <Col lg={{ span: 3 }}>
                    <Form.Select
                      aria-label="Category"
                      value={itemCategory}
                      onChange={(e) => {
                        setItemCategory(e.target.value);
                      }}
                      required
                    >
                      <option value="">Select Category</option>

                      <option value="Automobil">Automobil</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Health and Beauty">
                        Health and Beauty
                      </option>
                      <option value="Household">Household Products</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Product Category is required.
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>
                <br />
                <Form.Group as={Row} className="mb-3">
                  <Col lg={{ span: 3, offset: 3 }}>
                    <Form.Label>Measurement</Form.Label>
                  </Col>
                  <Col lg={{ span: 5 }}>
                    <Form.Control
                      type="text"
                      value={measurement}
                      onChange={(e) => {
                        setMeasurement(e.target.value);
                      }}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                     Measurement is required.
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>
                <br />
                <Form.Group as={Row} className="mb-3">
                  <Col lg={{ span: 3, offset: 3 }}>
                    <Form.Label>Quantity</Form.Label>
                  </Col>
                  <Col lg={{ span: 2 }}>
                    <Form.Control
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(e.target.value);
                      }}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Quantity is required.
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>
                <br />
                <Form.Group as={Row} className="mb-3">
                  <Col lg={{ span: 3, offset: 3 }}>
                    <Form.Label>Price</Form.Label>
                  </Col>
                  <Col lg={{ span: 2 }}>
                    <Form.Control
                      type="number"
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                      }}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Price is required.
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>
                <Row>
                  <Col>
                  <Button
                      variant="warning"
                      onClick={(f) => {
                        handleCloseUpdate(f, 10);
                      }}
                    >
                      Close
                    </Button>
                  </Col>
                  <Col>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      onClick={async (f) => {
                        await handleCloseUpdate(f, 10);
                        await updateItem(f);
                      }}
                    >
                      Update
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Modal.Body>
          </Modal>
          <Modal
            centered
            size="xl"
            show={showDelete}
            onHide={() => handleCloseDelete()}
          >
            <Modal.Header closeButton>
              <Modal.Title>Delete[Inactive] Inventory Item</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <h3>ARE YOU SURE?...</h3>
                <Row>
                  <Col>
                  <Button
                      variant="warning"
                      onClick={(f) => {
                        handleCloseDelete(f, 10);
                      }}
                    >
                      NO
                    </Button>
                  </Col>
                  <Col>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      onClick={async (f) => {
                        await handleCloseDelete(f, 10);
                        await deleteItem(f);
                      }}
                    >
                      YES
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Modal.Body>
          </Modal>
          <Col>
            {successMessageUp === true ? (
              <Alert variant="success">
                <Alert.Heading>SUCCESS</Alert.Heading>
                <p>Item successfully Updated</p>
                <hr />
                <Button
                  type="submit"
                  variant="outline-success"
                  onClick={(e) => {
                    setSuccessMsgUp(false);
                    window.location.reload();
                  }}
                >
                  Close
                </Button>
              </Alert>
            ) : null}
            {errorMsg === true ? (
              <Alert variant="danger">
                <Alert.Heading>FAILURE</Alert.Heading>
                <p>Failed to update/delete item OR Unauthorized Access</p>
                <hr />

                <Button
                  type="submit"
                  variant="outline-danger"
                  onClick={(e) => {
                    setErrorMsg(false);
                    window.location.reload();
                  }}
                >
                  Close
                </Button>
              </Alert>
            ) : null}
          </Col>
          <Row className="menu-center-text">
            <Col>
              <h2> WareHouse Inventory </h2>
            </Col>
          </Row>
          <Row className="menu-center-text mt-3">
            <Form
              className="mb-3"
              onSubmit={(e) => {
                retreiveItems(e);
              }}
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
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Loading..." : "Search"}
                  </Button>
                </Col>
                <Col className="col-md-2">
                  {userRole === "manager" ? (
                    <Button
                      onClick={(e) => {
                        navigate("/addItem");
                      }}
                    >
                      Add Product
                    </Button>
                  ) : null}
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
                      {userRole=="packer"?null:<th>Price</th>}
                      {userRole === "manager" ? <th></th> : null}
                      {userRole === "manager" ? <th></th> : null}
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
                            {userRole=="packer"?null:<td><b>$&nbsp;{Number(data.price).toFixed(2).toString()}</b></td>}
                            {userRole === "manager" ? (
                              <td>
                                <button
                                  className="btn btn-info"
                                  onClick={async (e) => {
                                    setItemId(data.itemId);
                                    setItemName(data.itemName);
                                    setItemProductId(data.itemProductId);
                                    setItemCategory(data.itemCategory);
                                    setMeasurement(data.measurement);
                                    setQuantity(data.quantity);
                                    setItemImage(data.itemImage);
                                    setPrice(Number(data.price));
                                    handleShowUpdate();
                                  }}
                                >
                                  Update
                                </button>
                              </td>
                            ) : null}
                             {userRole === "manager" ? (
                              <td>
                                <button
                                  className="btn btn-danger"
                                  onClick={async (e) => {
                                    setItemId(data.itemId);
                                    handleShowDelete();
                                  }}
                                >
                                  Delete
                                </button>
                              </td>
                            ) : null}
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

export default Inventory;