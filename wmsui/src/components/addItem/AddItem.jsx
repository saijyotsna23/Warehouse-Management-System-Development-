import React from 'react';
import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import axios from "axios";
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from "react-router-dom";

const AddItem = () => {

  const [validated, setValidated] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemProductId, setItemProductId] = useState("");
  const [itemCategory, setItemCategory] = useState("Water Pipes");
  const [measurement, setMeasurement] = useState("");
  const [itemImage, setItemImagePath] = useState(null);
  const [price, setPrice] = useState(null);
  const [successMessage, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  let navigate = useNavigate();

  const onSubmitItem = (event) => {
    event.preventDefault();
    setIsLoading(true);
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setIsLoading(false);
    }

    else {
      setSuccessMsg(false);
      setErrorMsg(false);
      let reqObj = {
        itemName,
        itemProductId,
        itemCategory,
        measurement,
        itemImage,
        price
      }
      axios.post(`${process.env.REACT_APP_API_URL}/inventory/insertItem`, reqObj, {
        headers: { "Content-Type": "multipart/form-data" }
      }).then(
        res => {
          setSuccessMsg(true);
          setIsLoading(false);
        }
      ).catch(err => {
        console.log(err);
        setErrorMsg(true);
        setIsLoading(false);
      })
    }
    setValidated(true);
  }
  return (
    <>
    
      <Container className='d-flex justify-content-center mt-3'>
        
        <Row>
          <Col> <h2> Add Product </h2></Col>

        </Row>
      </Container>
      <Container className='mt-3'>
        <Form noValidate validated={validated} onSubmit={onSubmitItem}>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="validationCustom01">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Product Name"
                value={itemName}
                onChange={(e) => { setItemName(e.target.value) }}
              />
              <Form.Control.Feedback type="invalid">Item name is required</Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md="4">
              <Form.Label>Product ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="PID"
                  required
                  value={itemProductId}
                  onChange={(e) => { setItemProductId(e.target.value) }}
                />
                <Form.Control.Feedback type="invalid">
                  Please mention product id of the item
                </Form.Control.Feedback>
            </Form.Group>
           </Row>
           <br/>
           <Row>
            <Form.Group as={Col} md="4">

              <Form.Label>Price</Form.Label>
              <InputGroup hasValidation>
                <InputGroup.Text id="inputGroupPrepend">$</InputGroup.Text>
                <Form.Control
                  type="text"
                  aria-describedby="inputGroupPrepend"
                  required
                  value={price}
                  onChange={(e) => { setPrice(e.target.value) }}
                />
                <Form.Control.Feedback type="invalid">
                  Price value required
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            
                <Form.Group as={Col} md="4" controlId="validationCustom02">
                  <Form.Label>Measurement</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={measurement}
                    onChange={(e) => { setMeasurement(e.target.value) }}
                  />
                  <Form.Control.Feedback type="invalid">Measurement is required</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col}  controlId="validationCustom02">
                  <Form.Label>Product Category</Form.Label>
                  <Form.Select aria-label="Default select example" 
                    value={itemCategory}
                    onChange={(e) => { setItemCategory(e.target.value) }} 
                    required = {true}
                    >
                    <option value="">Select Category</option>
                    <option  value="Automobil">Automobil</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Electronics">Electronics</option>
                    <option  value="Health and Beauty">Health and Beauty</option>
                    <option  value="Household">Household Products</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">Category is required</Form.Control.Feedback>
                </Form.Group>
          </Row>
          <br/>
          <Row>
            <Col></Col>
          <Form.Group as={Col} md="4">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              required
              name="itemImage"
              onChange={(e) => { setItemImagePath(e.target.files[0]) }}
            />
            <Form.Control.Feedback type="invalid" tooltip>
              Upload the image
            </Form.Control.Feedback>
          </Form.Group>
          <Col></Col>
          </Row>
         <br/><br/>
          
          <Button onClick={(e)=>{navigate('/inventory')}} variant='warning'>Go Back</Button> &nbsp;&nbsp;&nbsp;&nbsp;
          <Button type='submit'  disabled={isLoading}>{isLoading ? 'Please wait..., we are adding your product' : 'ADD PRODUCT'}</Button>
          
        </Form>


      </Container>

      <Container className='mt-2'>
        <Row>
          <Col>
            {(successMessage === true) ? <Alert variant="info" onClose={(e)=>{navigate('/inventory')}}>Item is successfully added</Alert> : null}
            {(errorMsg === true) ? <Alert variant="warning" onClose={(e)=>{navigate('/inventory')}}>Failed to add item</Alert> : null}
          </Col>
        </Row>
      </Container>


    </>
  )
}

export default AddItem;