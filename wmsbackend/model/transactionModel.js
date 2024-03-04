const { ElasticBeanstalk } = require('aws-sdk');
const dBconnection = require('../utilities/connection');
const {
    v4: uuidv4,
} = require('uuid');

let transactionOperations = {};

transactionOperations.createTransaction = async (transaction) => {
    // first update the inventory items by category
    // update the cart table (delete all cart items)
    //send data to purchases model
    //update the transaction status to complete
    try {
            let transactionModel = await dBconnection.getTransactionCollection();
            let cartModel = await dBconnection.getCartCollection();

            for (let trs of transaction.transactionItems) {
                let makeCartInactive = await cartModel.updateOne({ cartId: trs.cartId }, { $set: { itemActive: 0 } })
            }

            transaction.transactionStatus = "ordered";

            // console.log(transaction, "--after SUCCESS");
            let finalTransction = await transactionModel.create(transaction);
       
            return finalTransction;
        
    }
    catch (e) {
        // console.log(e);
        throw e;
    }

}

transactionOperations.updateTransaction = async (transaction) => {
    try {
        console.log(transaction);
            let transactionModel = await dBconnection.getTransactionCollection();
            let invntryModel = await dBconnection.getInventoryCollection();

            for (let trs of transaction.transactionItems) {
                let updateInvtry = await invntryModel.updateOne({ itemId: trs.itemId }, { $inc: { quantity: -trs.itemQuantity } })        
            }
            let registrationModel = await dBconnection.getRegistrationCollection();
            let isRecordMatch= await  registrationModel.find({"id" : transaction.userId });
            
            const existingDueAmount = Number(isRecordMatch[0].dueamount);
            const transactionTotal = Number(transaction.transactionTotal);
            // console.log(existingDueAmount,"DUEEEEEEEEE");
            // console.log(transactionTotal,"Totallllllll");
            // console.log(existingDueAmount + transactionTotal, "ADDDDDDDD");
            if (!isNaN(existingDueAmount) && !isNaN(transactionTotal)) {
            let latesttransac = {
                ...isRecordMatch,
                dueamount: Number(existingDueAmount + transactionTotal).toFixed(2).toString()
            };
              let updateUser = await registrationModel.updateOne({ id: transaction.userId }, { $set: latesttransac});
            }
            const filter = { "_id": transaction._id };
            const updateDocument = { $set: transaction };
            const result = await transactionModel.updateOne(filter, updateDocument);
            
    }
    catch (e) {
        throw e;
    }
}
transactionOperations.updateTransactionAfterRouting = async (transaction) => {
    try {
            let transactionModel = await dBconnection.getTransactionCollection();
            for (const item of transaction) {
                const filter = { _id: item._id };
                const updateDocument = { $set: item };
              
                try {
                  const result = await transactionModel.updateOne(filter, updateDocument);
                  console.log(`Document updated: ${result.nModified} document(s) modified`);
                } catch (error) {
                  console.error(`Error updating document with _id ${item._id}: ${error}`);
                }
              }
    }
    catch (e) {
        throw e;
    }
}

transactionOperations.updateTransactionAfterDelivery = async (item) => {
    try {
            let transactionModel = await dBconnection.getTransactionCollection();
                const filter = { _id: item._id };
                const updateDocument = { $set: item };
              
                try {
                  const result = await transactionModel.updateOne(filter, updateDocument);
                  console.log(`Document updated: ${result.nModified} document(s) modified`);
                } catch (error) {
                  console.error(`Error updating document with _id ${item._id}: ${error}`);
                }
    }
    catch (e) {
        throw e;
    }
}

transactionOperations.settleAmount = async (transac) => {
    try {
            let item=transac.transaction;
            let amount = transac.amount;
            let transactionModel = await dBconnection.getTransactionCollection();
            const filter = { _id: item._id };
            const updateDocument = { $set: item };

            let registrationModel = await dBconnection.getRegistrationCollection();
            let isRecordMatch= await  registrationModel.find({"id" : item.userId });
            
            const existingDueAmount = Number(isRecordMatch[0].dueamount);
            const settledAmount = Number(amount);
            if (!isNaN(existingDueAmount) && !isNaN(settledAmount)) {
            let latesttransac = {
                ...isRecordMatch,
                dueamount: Number(existingDueAmount - settledAmount).toFixed(2).toString()
            };
              let updateUser = await registrationModel.updateOne({ id: item.userId }, { $set: latesttransac});
            }
              
                try {
                  const result = await transactionModel.updateOne(filter, updateDocument);
                  console.log(`Document updated: ${result.nModified} document(s) modified`);
                } catch (error) {
                  console.error(`Error updating document with _id ${item._id}: ${error}`);
                }
    }
    catch (e) {
        throw e;
    }
}


transactionOperations.findtransactions = async (reqBody) => {
    try {
        let transactions = await dBconnection.getTransactionCollection();
        let  transactiondata = await transactions.find(reqBody).sort({transactionDate: 1, userId:-1});
        if (transactiondata.length > 0) {
            return transactiondata;
        } else {
            let err = new Error("Failed to get transactions");
            err.status = 404;
            throw err;
        }
    }
    catch (e) {
        console.log(e);
        throw e;
    }
}

transactionOperations.salesByDay = async () => {
    try {
        let transactions = await dBconnection.getTransactionCollection();
        const result = await transactions.aggregate([
            {
              $group: {
                _id: {
                  year: { $year: '$transactionDate' },
                  month: { $month: '$transactionDate' },
                  day: { $dayOfMonth: '$transactionDate' }
                },
                total: { $sum: { $toDouble: '$transactionTotal' } }
              }
            },
            {
                $project: {
                  _id: 0,
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day',
                  total: 1
                }
              },
            {
              $sort: {
                'year': 1,
                'month': 1,
                'day': 1
              }
            }
          ]);
        if (result.length > 0) {
            return result;
        } else {
            let err = new Error("Failed to sort");
            err.status = 404;
            throw err;
        }
    }
    catch (e) {
        console.log(e);
        throw e;
    }
}
transactionOperations.salesByMonth = async (reqBody) => {
    try {
        let transactions = await dBconnection.getTransactionCollection();
        const result = await transactions.aggregate([
            {
              $group: {
                _id: {
                  year: { $year: '$transactionDate' },
                  month: { $month: '$transactionDate' }
                },
                total: { $sum: { $toDouble: '$transactionTotal' } }
              }
            },
            {
              $project: {
                _id: 0,
                year: '$_id.year',
                month: '$_id.month',
                total: 1
              }
            },
            {
              $sort: {
                'year': 1,
                'month': 1
              }
            }
          ]);
          console.log(result,"month datatata");
        if (result.length > 0) {
            return result;
        } else {
            let err = new Error("Failed to sort");
            err.status = 404;
            throw err;
        }
    }
    catch (e) {
        console.log(e);
        throw e;
    }
}
transactionOperations.salesByYear = async () => {
    try {
        let transactions = await dBconnection.getTransactionCollection();
        const result = await transactions.aggregate([
            {
              $group: {
                _id: {
                  year: { $year: '$transactionDate' }
                },
                total: { $sum: { $toDouble: '$transactionTotal' } }
              }
            },
            {
                $project: {
                  _id: 0,
                  year: '$_id.year',
                  total: 1
                }
              },
            {
              $sort: {
                'year': 1
              }
            }
          ]);
        if (result.length > 0) {
            return result;
        } else {
            let err = new Error("Failed to sort");
            err.status = 404;
            throw err;
        }
    }
    catch (e) {
        console.log(e);
        throw e;
    }
}

module.exports = transactionOperations;