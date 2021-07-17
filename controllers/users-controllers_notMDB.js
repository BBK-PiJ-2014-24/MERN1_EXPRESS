const {validationResult} = require('express-validator');
const {v4: uuidv4} = require('uuid');
const HttpError = require('../models/http-error');

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Joe Blog',
        email: 'joe@gmail.com',
        password: 'test'
    }, 
]

const getUsers = (req, res, next) => {
    res.status(200).json({users: DUMMY_USERS});
}


const signup = (req, res, next) => {
    // Express-Validation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        throw new HttpError('Invalid Inputs', 402);
    }


    const {name, email, password} = req.body;

    const alreadyUser = DUMMY_USERS.find( u =>  u.email === email );
    if(alreadyUser){
        throw new HttpError('Could Not Create User. Email already exists', 422 );
    }


    const newUser = {
        id: uuidv4(),
        name,
        email,
        password
    };

    DUMMY_USERS.push(newUser);

    res.status(201).json({user: newUser});
}


const login = (req, res, next) => {

    const {email, password} = req.body;

    const user = DUMMY_USERS.find(u => u.email === email );

    if(!user || user.password !== password){
        throw new HttpError('Login Details Incorrect', 401);
    } 

    res.status(200).json({message: 'Logged In'});

}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;