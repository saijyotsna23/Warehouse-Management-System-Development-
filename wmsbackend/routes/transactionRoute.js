const router = require('express').Router();
const transactionModel = require('../model/transactionModel');
const userModel = require('../utilities/connection');

const {
    v4: uuidv4,
 } = require('uuid');


 router.post("/addtotransaction", async (req, res,next) => {
    try {
       let reqObj = req.body;
       reqObj.transactionDate = new Date();
       reqObj.transactionId = uuidv4();
       reqObj.transactionStatus = "Pending";
       reqObj.driveRoute="",
       reqObj.paymentStatus="",
       reqObj.receivedAmount="",
       reqObj.modeOfPayment="",
       reqObj.comments="",
       reqObj.driver = "";

      
       let isAdded = await transactionModel.createTransaction(reqObj);
       let userMode= await userModel.getRegistrationCollection();
      //  let userEmail = await userMode.find({id:isAdded.userId},{email:1})

       res.json({ "message": "Transaction is successfull" });
       
    }
    catch (e) {
       res.statusCode = e.status || 401;
       res.json({ "message": e.message });
    }
 });
 
 router.post("/updateTransaction", async (req, res,next) => {
   try {
      let reqObj = req.body.transaction;
      let isAdded = await transactionModel.updateTransaction(reqObj);

      res.json({ "message": "Transaction is successfull" });
      
   }
   catch (e) {
      res.statusCode = e.status || 401;
      res.json({ "message": e.message });
   }
});
router.post("/updateTransactionAfterRouting", async (req, res,next) => {
   try {
      let reqObj = req.body.transaction;
      let isAdded = await transactionModel.updateTransactionAfterRouting(reqObj);

      res.json({ "message": "Updation successfull" });
      
   }
   catch (e) {
      res.statusCode = e.status || 401;
      res.json({ "message": e.message });
   }
});
router.post("/updateTransactionAfterDelivery", async (req, res,next) => {
   try {
      let reqObj = req.body.transaction;
      let isAdded = await transactionModel.updateTransactionAfterDelivery(reqObj);

      res.json({ "message": "Updation successfull" });
      
   }
   catch (e) {
      res.statusCode = e.status || 401;
      res.json({ "message": e.message });
   }
});

router.post("/settleAmount", async (req, res,next) => {
   try {
      let isAdded = await transactionModel.settleAmount(req.body);

      res.json({ "message": "Updation successfull" });
      
   }
   catch (e) {
      res.statusCode = e.status || 401;
      res.json({ "message": e.message });
   }
});

 router.post("/gettransactions",async (req, res)=>{
   try{
      let reqBody={};
      if(req.body.userId)
         reqBody.userId = req.body.userId;
      if(req.body.status)
         reqBody.transactionStatus = req.body.status;
      let gettransactions = await transactionModel.findtransactions(reqBody);

      if (gettransactions && gettransactions.length > 0) {
         console.log('gettransaction successful');
         res.json(gettransactions);
      } else {
         console.log('No transactions found');
         res.json({ message: 'No transactions found' });
      }
   }
   catch(e){
       console.log("gettransaction Failed");
       res.statusCode=e.status;
       res.json({"message":e.message});
   }
});

router.post("/gettransactionsfordriver",async (req, res)=>{
   try{
      let reqBody={};
      if(req.body.driver)
         reqBody.driver = req.body.driver;
      if(req.body.status)
         reqBody.transactionStatus = req.body.status;
      let gettransactions = await transactionModel.findtransactions(reqBody);

      if (gettransactions && gettransactions.length > 0) {
         console.log('gettransaction successful');
         res.json(gettransactions);
      } else {
         console.log('No transactions found');
         res.json({ message: 'No transactions found' });
      }
   }
   catch(e){
       console.log("gettransaction Failed");
       res.statusCode=e.status;
       res.json({"message":e.message});
   }
});

router.post("/getSales",async (req, res)=>{
   try{
      let reqBody={};
      if(req.body.model)
         reqBody = req.body.model;
      let gettransactions={};
      console.log(reqBody);
      if(reqBody=="year")
      {
         gettransactions = await transactionModel.salesByYear();
      }
      else if(reqBody == "month")
      {
         gettransactions = await transactionModel.salesByMonth();
      }
      else{
         gettransactions = await transactionModel.salesByDay();
      }
      

      if (gettransactions && gettransactions.length > 0) {
         console.log('get sales successful');
         res.json(gettransactions);
      } else {
         console.log('No transactions found');
         res.json({ message: 'No transactions found' });
      }
   }
   catch(e){
       console.log("get sales Failed");
       res.statusCode=e.status;
       res.json({"message":e.message});
   }
});
 

module.exports = router;