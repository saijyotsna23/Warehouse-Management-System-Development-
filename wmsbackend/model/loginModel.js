const loginModelConnection = require('../utilities/connection');
let loginOperations = {};
loginOperations.validateLogin = async (data) => {
    try {
        
      
        let loginModel = await loginModelConnection.getRegistrationCollection();
        let loginvalid = await loginModel.find({
            "username" : data.username ,
            "password": data.password
        });
        if (loginvalid.length === 1) {
            return loginvalid;
        }
        else {
            let err = new Error("failed to login");
            err.status = 404;
            throw err;
        }
    }
    catch (e) {
        console.log(e);
        throw e;
    }

}
module.exports=loginOperations;