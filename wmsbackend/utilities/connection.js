const { Schema } = require('mongoose');
const mongoose = require('mongoose');


const url = "mongodb+srv://npolu:Rajesh456@cluster0.0uz9di1.mongodb.net/";


const RegistrationSchema = Schema(
    {
    id: { type: String, unique: true, required: [true, "userId is mandatory"] },
    i_d: { type: String, required: [true, "i_d is mandatory"] },
    fname: { type: String, required: [true, "first name is mandatory"] },
    lname: { type: String, required: [true, "last name is mandatory"] },
    dob: { type: String, required: [true, "Date of birth is mandatory"] },
    email: { type: String, unique: true, required: [true, "name is mandatory"] },
    phone: { type: Number, required: [true, "Mobile number is mandatory"] },
    username: { type: String, unique: true, required: [true, "userid is mandatory"] },
    password: { type: String, required: [true, "Mobile number is mandatory"] },
    address: { type: String, required: [true, "Address is mandatory"] },
    zip: { type: Number, required: [true, "Mobile number is mandatory"] },
    city: { type: String, required: [true, "city name is mandatory"] },
    state: { type: String, required: [true, "state name is mandatory"] },
    role:{type:String,default:"Customer"},
    customername: { type: String },
    customertype: { type: String },
    dueamount: { type: String },
    salesperson: {type: String},
    latitude: {type: String},
    longitude: {type: String}
    }, { collection: "Users" }
)


const InventorySchema = Schema(
    {
        itemId: { type: String, unique: true, required: [true, "itemId is mandatory"] },
        itemName: { type: String },
        itemProductId: { type: String },
        itemCategory: {type: String},
        measurement:{type:String},  
        quantity:{type: Number},
        itemImage: { type:String},
        price: {type:String},
        isActive: {type:String}
    }, { collection: "Inventory" }
)

const CartSchema= Schema(
    {
        cartId:{type:String},
        userId:{type:String}, // customerUserId
        itemId:{type:String},
        itemQuantity:{type:Number},
        itemCartPrice:{type:Number},
        totalPrice:{type:Number},
        itemActive:{type:Number}
       
    },{collection:"Cart"}
)

const transactionSchema = Schema(
    {
        transactionId:{type:String, required:true},
        transactionItems:{type:Array},
        transactionStatus:{type:String},
        transactionDate:{type:Date},
        transactionTotal:{type:String},
        transactionType:{type:String},
        userId:{type:String},
        driveRoute:{type:Array},
        paymentStatus: {type:String},
        receivedAmount: {type:String},
        modeOfPayment: {type:String},
        comments: {type:String},
        driver: {type: String}
    },{collection:"Transaction"}
)

let connection = {};

//database connection to register user details
connection.getRegistrationCollection = async () => {
    try {

        let dbConnection = await mongoose.connect(url, { dbName: 'WMS',useNewUrlParser: true, useUnifiedTopology: true })
        let model = await dbConnection.model('Users', RegistrationSchema)
        return model;
    }
    catch (e) {
        let err = new Error("could not connect to database");
        err.status = 500;
        throw err;
    }
}

connection.getInventoryCollection = async () => {
    try {
        let dbConnection = await mongoose.connect(url, { dbName: 'WMS', useNewUrlParser: true, useUnifiedTopology: true }); //db connect
        let model = await dbConnection.model('Inventory', InventorySchema);
        return model;
    }
    catch (e) {
        let err = new Error("could not connect to database");
        err.status = 500;
        throw err;
    }
}

connection.getTransactionCollection = async()=>{
    try{
        let dbConnection = await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }); //db connect
        let model = await dbConnection.model('Transaction', transactionSchema);
        return model;
    }
    catch(e){
        let err = new Error("Couldn't connect to database");
        err.status=500;
        throw err;

    }
}

connection.getCartCollection= async()=>{
    try{
        let dbConnection = await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        let model = await dbConnection.model("Cart",CartSchema);
        return model;
    }
    catch(e){
        let err= new Error("couldn't connect to database");
        err.status=500;
        throw err;
    }
}

module.exports = connection;