const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { body } = require('express-validator/check');
const User = require('../models/users');

router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid mail')
        .normalizeEmail()
        .custom(value => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc && !userDoc.signUpValidation) {
                        return Promise.reject('User is not verified mail yet!!');
                    }
                    return true;
                });
        }),
    body('password')
        .custom((value) => {
            if (value.length < 6)
                throw new Error('Please enter a valid password with atleast 6 characters length');
            return true;
        })
        .trim()
],
 authController.postLogin);
router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid mail')
        .normalizeEmail()
        .custom((value) => {
            return User.findOne({email : value})
            .then(userDoc => {
                if(userDoc) {
                    return Promise.reject('User already exists');
                }
                return true;
            });
        }),
    body('password', 'Please enter a valid alphanumeric password with atlease 6 characters length')
        .isAlphanumeric()
        .custom((value) => {
            if (value.length < 8)
                throw new Error();
            return true;
        })
        .trim(),
    body('confirmPassword', 'Password mismatch')
        .custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error();
            }
            return true;
        })
], authController.postSignup);

router.get('/verifySignUp/:token', authController.getVerifySignUp);

module.exports = router;