const userModelCollection = require('../utilities/connection');
const multer = require('multer');

let customerOperations = {};

customerOperations.getNameOfCustomer=async(username)=>{
    try{
        let userModel=await userModelCollection.getRegistrationCollection();
        let isCustomerExist=await userModel.find({username:username});
        if(isCustomerExist.length>0){
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

customerOperations.getAllSalespersons=async(reqBody)=>{
    try{
        let userModel = await userModelCollection.getRegistrationCollection();
        let allSalesPersons = await userModel.find({role: "sales person"});
        return allSalesPersons;
    }
    catch(e){
        let err = new Error("There are no salespersons to return");
        err.status = 404;
        throw err;
    }
    }

    customerOperations.getAllDrivers=async(reqBody)=>{
        try{
            let userModel = await userModelCollection.getRegistrationCollection();
            let allDrivers = await userModel.find({role: "driver"});
            return allDrivers;
        }
        catch(e){
            let err = new Error("There are no drivers to return");
            err.status = 404;
            throw err;
        }
        }
    

customerOperations.getCount=async(reqBody)=>{
try{
    let userModel = await userModelCollection.getRegistrationCollection();
    let customersCount = await userModel.count(reqBody);
    return customersCount;
}
catch(e){
   throw e;
}
}

customerOperations.getCustomersByName = async (reqBody, pageNum) => {
    try {
        let userModel = await userModelCollection.getRegistrationCollection();
        if (Object.keys(reqBody).length > 0) {
            let allCustomers={};
            if(pageNum != -1)
            {
             allCustomers = await userModel.find(
                reqBody
            ).sort({_id:-1}).skip(pageNum).limit(10);
            }
            else
            {
            allCustomers = await userModel.find(
                reqBody
                ).sort({_id:-1});
            }
            if (allCustomers.length > 0) {
                return allCustomers;
            }
            else {
                let err = new Error("There are no customers to return");
                err.status = 404;
                throw err;
            }
        }
        else {
            let allCustomers = {};
            if(pageNum >= 0)
            {
                allCustomers = await userModel.find(
                    reqBody
                ).sort({_id:-1}).skip(pageNum).limit(10);
            }
            else
            {
                allCustomers = await userModel.find(
                    reqBody
                ).sort({_id:-1});
            }
            if (allCustomers.length > 0) {
                return allCustomers;
            }
            else {
                let err = new Error("There are no customers to return");
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

module.exports = customerOperations;