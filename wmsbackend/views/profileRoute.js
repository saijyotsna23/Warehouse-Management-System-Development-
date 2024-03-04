const router = require('express').Router();
const profileModel = require('../model/profileModel');

router.post("/finduser", async (req, res, next) => {
    try {

        
        let findusers = await profileModel.finduserbyid(req.body.userid);
        if (findusers) {
        console.log("GET user success");
        res.json(findusers);
        }
        
    }
    catch (e) {
        console.log("GET /login Failed");
        res.statusCode=e.status||500;
        res.json({"message":e.message});
    }
});

router.post("/getedituser", async (req, res, next) => {
    try {

        
        let findusers = await profileModel.edituser(req.body.userid);
        if (findusers) {
        console.log("GET user success");
        res.json(findusers);
        }
        
    }
    catch (e) {
        console.log("GET /login Failed");
        res.statusCode=e.status||500;
        res.json({"message":e.message});
    }
});

module.exports = router;