const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionsSchema = new Schema({
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Groups',
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    item: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    multiPerson: String,
    individualTransaction: Object,
    personsDistributedAmounts: [
        {
            personsName: String,
            amountOfEachPersons: Number
        }
    ]
});

module.exports = mongoose.model('Transactions', transactionsSchema);