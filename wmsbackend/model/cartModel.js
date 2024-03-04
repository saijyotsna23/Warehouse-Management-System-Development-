const CartDBconnection = require('../utilities/connection');
const itemModelConncection = require('../utilities/connection');


let cartOperations = {};


cartOperations.getMyItems = async (userId) => {

    try {
        let cartModel = await CartDBconnection.getCartCollection();
        let userCart = await cartModel.find({ userId: userId,itemActive:1 })
      
        let inventoryModel = await itemModelConncection.getInventoryCollection();
        let totalDetailsofItem=[];
    
        for(let item of userCart){
            let cartObj={itemId:null,userId:null,itemQuantity:null,itemCartPrice:null,itemName:null,itemCategory:null,itemImage:null,cartId:null };

            let itemDetails= await inventoryModel.find({itemId:item.itemId},{itemName:1,itemImage:1,itemCategory:1});
          
             cartObj.itemName=itemDetails[0].itemName;
             cartObj.itemImage=itemDetails[0].itemImage;
             cartObj.itemId=item.itemId;
             cartObj.userId=item.userId;
             cartObj.itemQuantity=item.itemQuantity;
             cartObj.totalPrice=item.totalPrice;
             cartObj.itemCartPrice=item.itemCartPrice;
             cartObj.itemCategory=itemDetails[0].itemCategory;
             cartObj.cartId=item.cartId;
       
          totalDetailsofItem.push(cartObj);
        }

       

        if (totalDetailsofItem.length > 0) {

            return totalDetailsofItem;
        }
        else {
            let err = new Error("Cart is empty!");
            err.status = 404;
            throw err;
        }
    }
    catch (e) {
        console.log(e);
        throw (e);
    }
}

cartOperations.insertCartItem=async(item)=>{
    try{
    let cartModel = await CartDBconnection.getCartCollection();
        let itemAlreadyIncart = await cartModel.find({ userId:item.userId, itemId:item.itemId, itemActive:1 });
        if(itemAlreadyIncart.length>0){
            let err= new Error("Item already in cart");
            err.status=400;
            throw err;
        }
        else{
            //get image name logic here
            let isItemAdded=await cartModel.create(item);
            return isItemAdded;
        }
    }
    catch(e){
        throw e;
    }

}

cartOperations.deleteCartItem = async (cartId,userId)=>{
    try{
        let cartModel = await CartDBconnection.getCartCollection();
        let idDeleted = await cartModel.deleteOne({cartId:cartId});

        let presentCartItems= await cartOperations.getMyItems(userId)

        return presentCartItems;
    }
    catch(e){
        let err = new Error("Failed to delete cart item");
        err.status= 401;
        throw e||err;

    }
}

cartOperations.increaseQty = async(cartId,userId)=>{
    try{
        // console.log(userId);
        let cartModel = await CartDBconnection.getCartCollection();
        let cartItemDetails = await cartModel.find({cartId:cartId});
        let isQtyIncreased= await cartModel.updateOne({cartId:cartId},{$inc:{itemQuantity:1,totalPrice:cartItemDetails[0].itemCartPrice}});
        
        if(isQtyIncreased.modifiedCount>0){
            let updatdCartItems=await cartOperations.getMyItems(userId);
            return updatdCartItems;
        }
        else{
            let err= new Error("Item not found");
            err.status=401;
            throw err;
        }
    }
    catch(e){
        console.log(e);
        throw e;
    }
}

cartOperations.decreaseQty = async(cartId,userId)=>{
    try{
        let cartModel = await CartDBconnection.getCartCollection();
        let cartItemDetails = await cartModel.find({cartId:cartId});
        let isQtyDecreased= await cartModel.updateOne({cartId:cartId},{$inc:{itemQuantity:-1,totalPrice:-cartItemDetails[0].itemCartPrice}});
      
        if(isQtyDecreased.modifiedCount>0){
            let cartItemDetails = await cartModel.find({cartId:cartId});
            if(cartItemDetails[0].totalPrice===0){
                let deleteCartItem = await cartOperations.deleteCartItem(cartId,userId);
                return deleteCartItem;
            }

            let updatdCartItems=await cartOperations.getMyItems(userId);
            return updatdCartItems;
        }
        else{
            let err= new Error("Item not found");
            err.status=401;
            throw err;
        }
    }
    catch(e){
        console.log(e,"in decrease");
        throw e;
    }
}

module.exports = cartOperations;