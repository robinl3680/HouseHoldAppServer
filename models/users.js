const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    groups: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Groups'
        }
    ],
    signUpToken: String,
    signUpExpires: Date,
    signUpValidation: Boolean
});

module.exports = mongoose.model('User', userSchema);