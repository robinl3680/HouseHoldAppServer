const JSWT = require('jsonwebtoken');
module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader) {
        const err = new Error('User is not authorized!');
        err.statusCode = 401;
        throw err;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = JSWT.verify(token, 'supersecret');
    } catch(err) {
        err.statusCode = 500;
        throw err;
    }
    if(!decodedToken) {
        const err = new Error('User is not authorized!');
        err.statusCode = 401;
        throw err;
    }
    req.userId = decodedToken.userId;
    req.isAuth = true;
    next();
};