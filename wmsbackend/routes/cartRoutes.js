const router = require('express').Router();
const cartModel = require('../model/cartModel');
const {
   v4: uuidv4,
} = require('uuid');

router.get("/myitems/:userId", async (req, res, next) => {
   try {
      let userId = req.params.userId;
    

      let cartItems = await cartModel.getMyItems(userId);

      res.json(cartItems);
   }
   catch (e) {
      res.statusCode = e.status || 401;
      res.json({ "message": e.message });
   }
});

router.post("/addtocart", async (req, res,next) => {
   try {
      let reqObj = req.body;
      reqObj.itemQuantity = 1;
      reqObj.totalPrice = reqObj.itemCartPrice;
      reqObj.cartId = uuidv4();
      reqObj.itemActive=1;
      let isAdded = await cartModel.insertCartItem(reqObj);
      if (isAdded) {
         res.json({ "message": "Item added to cart" });
      }
   }
   catch (e) {
      res.statusCode = e.status || 401;
      res.json({ "message": e.message });
   }
});

router.post("/increaseQty", async (req, res, next) => {
   try {
      let cartId = req.body.cartId;
      let userId=req.body.userId;
      let isQtyIncreased = await cartModel.increaseQty(cartId,userId);
     
         console.log("POST /increaseQty success")
         res.json(isQtyIncreased);
      
   }
   catch (e) {
      console.log("POST /increaseQty failed")
      res.statusCode = e.status || 401;
      res.json({ "message": e.message });
   }
})

router.post("/decreaseQty", async (req, res, next) => {
   try {
      let cartId = req.body.cartId;
      let userId=req.body.userId;
      let isQtyDecreased = await cartModel.decreaseQty(cartId,userId);
      
         console.log("POST /decreaseQty success");
         res.json(isQtyDecreased)
      
   }
   catch (e) {
      console.log("POST /decreaseQty failed")
      res.statusCode = e.status || 404;
      res.json({ "message": e.message });
   }
})

router.delete("/deleteCartItem", async(req,res, next)=>{

   try{
      let cartId = req.body.cartId;
      let userId=req.body.userId;
      let isCartItemDeleted = await cartModel.deleteCartItem(cartId,userId);

      console.log("DELETE /deleteCartItem successfull");
      res.json(isCartItemDeleted);
   }
   catch(e){
      console.log("DELETE /deleteCartItem failed")
      res.statusCode = e.status || 404;
      res.json({ "message": e.message });
   }

})

module.exports = router;