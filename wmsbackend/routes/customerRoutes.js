const router = require('express').Router();
const customerModel = require('../model/customerModel');

router.post("/getCustomersByName", async (req, res, next) => {
    try {
        let reqBody = req.body;
        let newSearchBody = {};
        let pageNum = 0;
        if (reqBody.pageNum >= 0) {
            pageNum = reqBody.pageNum * 10;
        }
        if (reqBody.pageNum == -1) {
            pageNum = -1;
        }
        if (reqBody.searchCustomer != "") {
            const re = new RegExp(reqBody.searchCustomer, 'i');
            newSearchBody.customername = { $regex: re };
        }
        if(reqBody.searchSalesperson != "") {
            newSearchBody.salesperson = reqBody.searchSalesperson;
        }
        newSearchBody.role= "customer";
        let searchResults = await customerModel.getCustomersByName(newSearchBody, pageNum);
        console.log("POST /getCustomersByName/ success");
        res.json(searchResults);
    }
    catch (e) {
        console.log("GET /getCustomersByName/ failed");
        res.statusCode = e.status || 500;
        res.json(e.message);
    }
})

router.get("/getAllSalespersons", async (req, res, next) => {
    try {
        let searchResults = await customerModel.getAllSalespersons();
        console.log("POST /getAllSalespersons/ success");
        res.json(searchResults);
    }
    catch (e) {
        console.log("GET /getAllSalespersons/ failed");
        res.statusCode = e.status || 500;
        res.json(e.message);
    }
})

router.get("/getAllDrivers", async (req, res, next) => {
    try {
        let searchResults = await customerModel.getAllDrivers();
        console.log("POST /getAllDrivers/ success");
        res.json(searchResults);
    }
    catch (e) {
        console.log("GET /getAllDrivers/ failed");
        res.statusCode = e.status || 500;
        res.json(e.message);
    }
})


router.post("/itemCount", async (req, res, next) => {

    try {
        let reqBody=req.body;
        let newSearchBody = {};
        if(reqBody.searchSalesperson != "") {
            newSearchBody.salesperson = reqBody.searchSalesperson;
        }
        if (reqBody.searchCustomer != "") {
            const re = new RegExp(reqBody.searchCustomer, 'i');
            newSearchBody.username = { $regex: re };
        }
        newSearchBody.role= "customer";
        let itemNo = await customerModel.getCount(newSearchBody);
        let CeilVal = Math.ceil(itemNo / 10);
        res.json({ "count": CeilVal });
    }
    catch (e) {
        res.json({ "message": e }).statusCode = 400;
    }
})

module.exports = router;