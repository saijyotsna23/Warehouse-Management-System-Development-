const inventoryCollection = require('../utilities/connection');
const multer = require('multer');

let inventoryOperations = {};

inventoryOperations.updateItem=async(data)=>{
    try {
        let inventoryModel = await inventoryCollection.getInventoryCollection();
           let isRecordUpdated= await inventoryModel.updateOne(
            {'itemId': data.itemId},
            {$set:{'itemId':data.itemId, 'itemName':data.itemName, 'itemProductId':data.itemProductId, 'itemCategory':data.itemCategory, 'measurement':data.measurement, 'quantity':data.quantity, 'itemImage':data.itemImage, 'price': data.price}}
           );

            if(isRecordUpdated){
                return true;
            }
            else{
                let err=new Error("Failed to update record");
                err.status=401;
                throw err;
            }
            
        
    } catch (error) {
        console.log(error);
        if(!error.status){
            error.status=404;
        }
        throw error;
    }
}

inventoryOperations.deleteItem=async(data)=>{
    try {
        let inventoryModel = await inventoryCollection.getInventoryCollection();
           let isRecordUpdated= await inventoryModel.updateOne(
            {'itemId': data.itemId},
            {$set:{'isActive': '0'}}
           );

            if(isRecordUpdated){
                return true;
            }
            else{
                let err=new Error("Failed to delete record");
                err.status=401;
                throw err;
            }
            
        
    } catch (error) {
        console.log(error);
        if(!error.status){
            error.status=404;
        }
        throw error;
    }
}

inventoryOperations.getNameOfItem=async(itemName,isActive)=>{
    try{
        let inventoryModel=await inventoryCollection.getInventoryCollection();
        let isItemExist=await inventoryModel.find({itemName:itemName, isActive: isActive});
        if(isItemExist.length>0){
            return true;
        }
        else{
            return false;
        }
    }
    catch(e){
        throw e;
    }
}

inventoryOperations.getCount=async(reqBody)=>{
try{
    let inventoryModel = await inventoryCollection.getInventoryCollection();
    let itemsCount = await inventoryModel.count(reqBody);
    return itemsCount;
}
catch(e){
   throw e;
}
}

inventoryOperations.getItemsByName = async (reqBody, pageNum) => {
    try {
        let inventoryModel = await inventoryCollection.getInventoryCollection();
        if (Object.keys(reqBody).length > 0) {
            let allItems = {};
            if(pageNum >= 0)
            {
                allItems = await inventoryModel.find(
                    reqBody
                ).sort({_id:-1}).skip(pageNum).limit(10);
            }
            else
            {
                allItems = await inventoryModel.find(
                    reqBody
                ).sort({_id:-1});
            }
            if (allItems.length > 0) {
                return allItems;
            }
            else {
                let err = new Error("There are no items to return");
                err.status = 404;
                throw err;
            }
        }
        else {
            let allItems = {};
            if(pageNum >= 0)
            {
                allItems = await inventoryModel.find(
                    reqBody
                ).sort({_id:-1}).skip(pageNum).limit(10);
            }
            else
            {
                allItems = await inventoryModel.find(
                    reqBody
                ).sort({_id:-1});
            }
            if (allItems.length > 0) {
                return allItems;
            }
            else {
                let err = new Error("There are no items to return");
                err.status = 404;
                throw err;
            }
        }
    }
    catch (e) {
        console.log(e);
        throw e;
    }
}

inventoryOperations.insertOneItem = async (data) => {
    try {
        let inventoryModel = await inventoryCollection.getInventoryCollection();
        let isRecordInserted = await inventoryModel.create(data);
        if (isRecordInserted) {
            return true;
        }
        else {
            let err = new Error("Failed to insert record");
            err.status = 401;
            throw err;
        }
    } catch (error) {
        console.log(error);
        if (!error.status) {
            error.status = 404;
        }
        throw error;
    }
}

module.exports = inventoryOperations;