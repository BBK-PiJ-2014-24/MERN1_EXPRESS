const {validationResult} = require('express-validator');
const {v4: uuidv4} = require('uuid');
const HttpError = require('../models/http-error');

const User = require('../models/user'); // Mongoose model

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


const signup = async (req, res, next) => {
    // Express-Validation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new HttpError('Invalid Inputs', 402);
        return next(error);
    }


    const {name, email, password, places} = req.body;

    let alreadyUser;
    try{
        alreadyUser = await User.findOne({email: email});
    } catch(err) {
        const error = new HttpError('Sign Up Failed', 500);
        return next(error);
    }
    
    if(alreadyUser){
        const error = new HttpError('Could Not Create User. Email already exists', 422 );
        return next(error);
    }
    
    const newUser = new User( {
        name,
        email,
        image:'https://images.pexels.com/photos/839011/pexels-photo-839011.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
        password,
        places,
    });

    try {
        await newUser.save();
    } catch(err) {
        const error = new HttpError('Failed to Set Up User', 500 );
        return next(error);
    }

    res.status(201).json({user: newUser.toObject({getters: true})});
}


const login = (req, res, next) => {

    const {email, password} = req.body;

    const user = DUMMY_USERS.find(u => u.email === email );

    if(!user || user.password !== password){
        return next(new HttpError('Login Details Incorrect', 401));
    } 

    res.status(200).json({message: 'Logged In'});

}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;