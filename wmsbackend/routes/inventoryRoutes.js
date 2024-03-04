const router = require('express').Router();
const inventoryModel = require('../model/inventoryModel');
const fs = require("fs");
const multer = require('multer');
const s3Operations = require('./awsS3');


const {
    v4: uuidv4
} = require('uuid');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const BUCKET = "wmsproducts";

router.post("/updateitem", async (req, res) => {
    try{
          
        let inventoryitem = {
            itemId:req.body.itemId,
            itemName:req.body.itemName,
            itemProductId:req.body.itemProductId,
            itemCategory:req.body.itemCategory,
            measurement:req.body.measurement,
            quantity:req.body.quantity,
            itemImage:req.body.itemImage,
            price: req.body.price

        };
        let isUpdated = await inventoryModel.updateItem(inventoryitem);
        if (isUpdated) {
            console.log("POST update Inventory Item successfull");
            res.json({ "message": "Item updated successfully" });
        }
    }
    catch(e){
        console.log("POST updateItem Failed");
        res.json({ "message": e.message });
    }
    
});

router.post("/deleteitem", async (req, res) => {
    try{
          
        let inventoryitem = {
            itemId:req.body.itemId

        };
        let isDeleted = await inventoryModel.deleteItem(inventoryitem);
        if (isDeleted) {
            console.log("POST Inventory Item set to inactive successfully");
            res.json({ "message": "Item deleted successfully" });
        }
    }
    catch(e){
        console.log("POST deleteItem Failed");
        res.json({ "message": e.message });
    }
    
});

// itemImage: {
//     data: fs.readFileSync("src/uploads/" + req.file.filename),
//     contentType: "image/png",
// }
router.post("/insertItem", upload.single("itemImage"), async (req, res, next) => {
    try {
        let item = {
            itemId: uuidv4(),
            itemName:req.body.itemName,
            itemProductId:req.body.itemProductId,
            itemCategory:req.body.itemCategory,
            measurement:req.body.measurement,
            quantity:0,
            itemImage:req.body.itemImage,
            price: req.body.price,
            isActive: "1"
        };
        let itemAlreadyExist = await inventoryModel.getNameOfItem(req.body.itemName, "1");
        if (itemAlreadyExist === false)
        {
            req.file.originalname = `${uuidv4() + req.file.originalname}`;
            let resp = await s3Operations.s3UploadsV3(req.file);
            let url = `https://${BUCKET}.s3.amazonaws.com/${req.file.originalname}`;
            item.itemImage = url;
    
            let isInserted = await inventoryModel.insertOneItem(item);
            if (isInserted) {
                console.log("POST insertItem successfull");
                res.json({ "message": "Item inserted successfully" });
            }
        }
        else {
            let err = new Error("Item already exists");
            err.status = 401;
            throw err;
        }
    }
    catch (e) {
        console.log("POST insertItem Failed");
        res.statusCode = e.status || 501;
        res.json({ "message": e.message });
    }
});

router.post("/getItemsByName", async (req, res, next) => {
    try {
        let reqBody = req.body;
        let newSearchBody = {};
        let pageNum = 0;
        if (reqBody.pageNum >= 0) {
            pageNum = reqBody.pageNum * 10;
        } else if (reqBody.pageNum === -1) {
            pageNum = -1;
        }
        
        if (reqBody.searchItem != "") {
            const re = new RegExp(reqBody.searchItem, 'i');
            newSearchBody.itemName = { $regex: re };
        }
        if(reqBody.searchCategory != "") {
            newSearchBody.itemCategory = reqBody.searchCategory;
        }
        if(reqBody.isActive != "") {
            newSearchBody.isActive = reqBody.isActive;
        }
        // newSearchBody.isActive="1";
        let searchResults = await inventoryModel.getItemsByName(newSearchBody, pageNum);
        console.log("POST /getItemsByName/ success");
        res.json(searchResults);
    }
    catch (e) {
        console.log("GET /getItemsByName/ failed");
        res.statusCode = e.status || 500;
        res.json(e.message);
    }
})

router.post("/itemCount", async (req, res, next) => {

    try {
        let reqBody=req.body;
        let newSearchBody = {};
        if(reqBody.searchCategory != "") {
            newSearchBody.itemCategory = reqBody.searchCategory;
        }
        if (reqBody.searchItem != "") {
            const re = new RegExp(reqBody.searchItem, 'i');
            newSearchBody.itemName = { $regex: re };
        }
        if(reqBody.isActive != "") {
            newSearchBody.isActive = reqBody.isActive;
        }
        // newSearchBody.isActive="1";
        let itemNo = await inventoryModel.getCount(newSearchBody);
        let CeilVal = Math.ceil(itemNo / 10);
        res.json({ "count": CeilVal });
    }
    catch (e) {
        res.json({ "message": e }).statusCode = 400;
    }
})

module.exports = router;