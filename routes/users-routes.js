const express = require('express');
const {check} = require('express-validator');

const HttpError = require('../models/http-error');
const usersControllers = require('../controllers/users-controllers');

// Express Validator
// -----------------
const validationSignUp = [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({min: 6}),
];


// ROUTES
// ------
const router = express.Router();

router.get('/', usersControllers.getUsers );

router.post('/signup', validationSignUp, usersControllers.signup );

router.post('/login', usersControllers.login );


module.exports = router;