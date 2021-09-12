const express = require('express');
const app = express();
const authRouter = require('./routes/auth');
const MONGO_URI = 'mongodb+srv://Robin:Robin80@householdappcluster.bw9wf.mongodb.net/HouseHoldApp?retryWrites=true&w=majority'
const mongoose = require('mongoose');
const allowAccessOrgin = require('./utils/allow-access-orgin');
const authMiddleWare = require('./middleware/auth');
const groupRouter = require('./routes/groups');

app.use(allowAccessOrgin);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/groups', authMiddleWare, groupRouter);

app.use((err, req, res, next) => {
    console.log(err);
    const message = err.message;
    const data = err.data;
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: message,
        data: data
    });
})

mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
.then((result) => {
    app.listen(3300, () => {
        console.log("Server started");
    });
}).catch(err => {
    console.log(err);
})