const User = require('../models/users');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check')
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.SEND_GRID_KEY
    }
}));
const JSWT = require('jsonwebtoken');

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        const err = new Error();
        err.statusCode = 422;
        err.message = errors.array()[0].msg;
        throw err;
    }
    User.findOne({ email: email })
    .then( user => {
        if(user) {
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (!doMatch) {
                        const err = new Error();
                        err.statusCode = 401;
                        err.message = 'Password mismatch'
                        throw err;
                    }
                    const token = JSWT.sign({
                        email: email,
                        userId: user._id.toString()
                    }, 'supersecret', {
                        expiresIn: '1h'
                    });
                    return res.status(200).json({
                        authenticated: 'Success',
                        email: email,
                        token: token
                    });
                }).catch(err => {
                    return next(err);
                });
        } else {
            const err = new Error();
            err.statusCode = 404;
            err.message = 'No such user exists'
            throw err;
        }
    }).catch(err => {
        next(err);
    });
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const phone = +req.body.phone;
    const name = req.body.name;
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        const err = new Error();
        err.statusCode = 422;
        err.message = errors.array()[0].msg;
        throw err;
    }
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            const err = new Error();
            err.statusCode = 422;
            err.message = "Crypto error";
            throw err;
        }
        const token = buffer.toString('hex');
        bcrypt.hash(password, 12)
        .then(hashPassword => {

            transporter.sendMail({
              to: email,
              from: process.env.SOURCE_MAIL,
              subject: "Verify your email",
              html: `<h2> You are successfully signed up for the <b> House Hold Utility App </b> </h2>
                      <p> Please click on the following link to verify your account</p>
                      <a href="https://householdapp-server.onrender.com/auth/verifySignUp/${token}"> Click to verify </a>`,
            });
           
            const newUser = new User({
                email: email,
                password: hashPassword,
                phone: phone,
                name: name,
                signUpToken: token,
                signUpExpires: Date.now() + 3600000
            });
            return newUser.save();
        }).then(() => {
            res.status(200).json({
              signup:
                "Successfully sent mail to verify, please verify and login!",
            });
        }).catch(err => {
           next(err);
        });
    });
}

exports.getVerifySignUp = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ signUpToken: token, signUpExpires: { $gt : Date.now() }})
    .then(user => {
        if(!user) {
            const err = new Error();
            err.statusCode = 404;
            err.message = 'No user is found';
            throw err;
        }
        user.signUpValidation = true;
        user.signUpExpires = null;
        user.signUpToken = '';
        return user.save();
    }).then(() => {
        res.status(200).send('<h2>Successfully verified mail please log in</h2>');
    }).catch(err => {
        next(err);
    });
}
