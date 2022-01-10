const Transaction = require('../models/transactions');
const User = require('../models/users');
const Group = require('../models/groups');

exports.newTransaction = async(req, res, next) => {
    try{
        const groupId = req.body.groupId;
        const item = req.body.item;
        const userId = req.userId;
        let user = await User.findById(userId);
        if(user.name !== item.person) {
            user = await User.findOne({name: item.person});
        }
        if (!user) {
            const error = new Error();
            error.statusCode = 402;
            error.message = 'No such user exists';
            throw error;
        }
        const group = await Group.findById(groupId);
        if(!group) {
            const error = new Error();
            error.statusCode = 402;
            error.message = 'No such group exists';
            throw error;
        }
        const transaction = new Transaction({
            item: item.item,
            amount: item.amount,
            date: item.date,
            multiPerson: item.multiPerson,
            individualTransaction: item.individualTransaction,
            personsDistributedAmounts: item.personsDistributedAmounts,
            owner: user._id,
            group: groupId
        });
        group.transactions.push(transaction);
        await group.save();
        const updatedTransaction = await transaction.save();
        return res.status(200).json({
            message: 'Data added successfully',
            transaction: updatedTransaction
        });
    }catch(err) {
        next(err);
    }
};

exports.getTransactions = async(req, res, next) => {
    try{
        const groupId = req.params.groupId;
        const userId = req.userId;
        const transactions = await Transaction.find({ group: groupId })
                            .populate('owner');
        if (!transactions) {
            const error = new Error();
            error.statusCode = 402;
            error.message = 'No such transaction exists';
            throw error;
        }
        const returnVal = transactions.map((transaction) => {
            return {
                ...transaction._doc,
                person: transaction.owner.name,
                date: new Date(transaction.date.toString()).toLocaleDateString()
            }
        });
        return res.status(200).json({
            message: 'Retrieved data',
            items: returnVal
        });
    }catch(err) {
        next(err);
    }
}

exports.modifyTransaction = async(req, res, next) => {
    try{
        const groupId = req.body.groupId;
        const item = req.body.item;
        const transactionId = req.params.id;
        const userId = req.userId;
        const transaction = await Transaction.findById(transactionId);
        if(!transaction) {
            const err = new Error();
            err.message = 'No such transaction exist!';
            err.statusCode = 402;
            throw err;
        }
        for(let key in item) {
            if(transaction[key] !== item[key]) {
                transaction[key] = item[key];
            }
        }
        await transaction.save();
        return res.status(200).json({
            message: 'Updated transaction!!'
        });
    }catch(err) {
        next(err);
    }
};

exports.deleteTransaction = async (req, res, next) => {
    try{
        const groupId = req.params.id.split(':')[0];
        const transId = req.params.id.split(':')[1];
        const userId = req.userId;
        const transaction = await Transaction.deleteOne({_id: transId});
        if(!transaction) {
            const err = new Error();
            err.message = 'No such transaction exist!';
            err.statusCode = 402;
            throw err;
        }
        const group = await Group.findById(groupId);
        if(!group) {
            const err = new Error();
            err.message = 'No such group exists!!';
            err.statusCode = 402;
            throw err;
        }
        group.transactions.splice(group.transactions.indexOf(transId), 1);
        await group.save();
        return res.status(200).json({
            message: 'Deleted successfully'
        });
    }catch(err) {
        next(err);
    }
}