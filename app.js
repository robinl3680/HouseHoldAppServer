const express = require('express');
const app = express();
const authRouter = require('./routes/auth');
const mongoose = require('mongoose');
const allowAccessOrgin = require('./utils/allow-access-orgin');
const authMiddleWare = require('./middleware/auth');
const groupRouter = require('./routes/groups');
const transactionRouter = require('./routes/transactions');
const compression = require('compression');
const helmet = require('helmet');

app.use(allowAccessOrgin);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(compression());
app.use(helmet());
app.use('/auth', authRouter);
app.use('/groups', authMiddleWare, groupRouter);
app.use('/transactions', authMiddleWare, transactionRouter);

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

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then((result) => {
    app.listen(process.env.PORT || 3300, () => {
        console.log("Server started");
    });
}).catch(err => {
    console.log(err);
})
