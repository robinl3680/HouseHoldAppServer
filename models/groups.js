const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    items: [
        {
            type: String
        }
    ],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    transactions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Transactions'
        }
    ]
});

module.exports = mongoose.model('Groups', groupSchema);