const router = require('express').Router();
const registrationModel = require('../model/registrationModel');
const CryptoJS = require('crypto-js');

const { 
    v4: uuidv4,
  } = require('uuid');

router.post("/insert", async (req, res) => {
    try{
        const passphrase = '123';
        const pass=req.body.password;
   
        const bytes = CryptoJS.AES.decrypt(pass, passphrase);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
       
        let user = {
            id:uuidv4(),
            i_d: req.body.i_d,
            fname:req.body.fname,
            lname:req.body.lname,
            dob:req.body.dob,
            email:req.body.email,
            phone:req.body.phone,
            username:req.body.username,
            password:originalText,
            address:req.body.address,
            zip:req.body.zip,
            city:req.body.city,
            state:req.body.state,
            role: req.body.role,
            customername: req.body.customername,
            customertype: req.body.customertype,
            dueamount: req.body.dueamount,
            salesperson: req.body.salesperson,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        };
        let isInserted = await registrationModel.insertUser(user);
        if (isInserted) {
            console.log("POST userdetails successfull");
            res.json({ "message": "user details inserted successfully" });
        }
    }
    catch(e){
        console.log("POST insertItem Failed");
        res.statusCode=e.status;
        res.json({"message":e.message});
    }
    
});

router.post("/update", async (req, res) => {
    try{

        let user = {
            id:req.body.userid,
            i_d:req.body.i_d,
            fname:req.body.fname,
            lname:req.body.lname,
            dob:req.body.dob,
            phone:req.body.phone,
            username:req.body.username,
            password:req.body.password,
            address:req.body.address,
            zip:req.body.zip,
            city:req.body.city,
            state:req.body.state,
            role:req.body.role,
            customername: req.body.customername,
            customertype: req.body.customertype,
            dueamount: req.body.dueamount,
            salesperson: req.body.salesperson,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        };
        // console.log(user);
        let isUpdated = await registrationModel.updateUser(user);
        if (isUpdated) {
            console.log("POST userupdatedetails successfull");
            res.json({ "message": "user details updated successfully" });
        }
    }
    catch(e){
        console.log("POST updateuserdetails Failed");
        res.statusCode=e.status;
        res.json({"message":e.message});
    }
    
});

module.exports = router;