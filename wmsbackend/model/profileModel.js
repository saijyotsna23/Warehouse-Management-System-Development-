const profileModelConnection = require('../utilities/connection');

let profileOperations = {};

profileOperations.finduserbyid = async (userid) => {
    try {
        
        let profileModel = await profileModelConnection.getRegistrationCollection();
        let userdata = await profileModel.find({
            id : userid
        },{password:0});
        if (userdata.length === 1) {
            return userdata;
        }
        else {
            let err = new Error("failed to load profile");
            err.status = 404;
            throw err;
        }
    }
    catch (e) {
        console.log(e);
        throw e;
    }

}

profileOperations.edituser = async (userid) => {
    try {
        
        let profileModel = await profileModelConnection.getRegistrationCollection();
        let userdata = await profileModel.find({
            id : userid
        });
        if (userdata.length === 1) {
            return userdata;
        }
        else {
            let err = new Error("failed to load profile");
            err.status = 404;
            throw err;
        }
    }
    catch (e) {
        console.log(e);
        throw e;
    }

}

module.exports=profileOperations;