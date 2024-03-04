const registartionModelConnection = require('../utilities/connection');

let registrationOperations = {};


registrationOperations.insertUser=async(data)=>{
    try {
        let registrationModel = await registartionModelConnection.getRegistrationCollection();
        let isRecordMatch= await  registrationModel.find({"username" : data.username });
        if(isRecordMatch.length > 0)
        {
            let err=new Error("record was already existed");
            err.status=401;
            throw err;
        }
        else{
            let isRecordInserted= await registrationModel.create(data);
            if(isRecordInserted){
                return true;
            }
            else{
                let err=new Error("Failed to insert record");
                err.status=401;
                throw err;
            }
            
        }
        
    } catch (error) {
        console.log(error);
        if(!error.status){
            error.status=404;
        }
        throw error;
    }
}

registrationOperations.updateUser=async(data)=>{
    try {
        let registrationModel = await registartionModelConnection.getRegistrationCollection();
        let myquery = { id:data.id };
        let newvalues = {
          $set: {
            i_d: data.i_d,
            fname: data.fname,
            lname: data.lname,
            dob: data.dob,
            username: data.username,
            password: data.password,
            address: data.address,
            zip: data.zip,
            city: data.city,
            state: data.state,
            phone: data.phone,
            role: data.role,
            customername: data.customername,
            customertype: data.customertype,
            dueamount: data.dueamount,
            salesperson: data.salesperson,
            latitude: data.latitude,
            longitude: data.longitude
          },
        };
        let isRecordMatch= await  registrationModel.find({id : data.id});
        if(isRecordMatch.length === 1)
        {
            let isRecordUpdated= await registrationModel.updateOne(myquery, newvalues);
   
            if(isRecordUpdated){
                return true;
            }
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

module.exports=registrationOperations;