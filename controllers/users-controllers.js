const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

const mongoose = require("mongoose");
const User = require("../models/user"); // Mongoose model

// const DUMMY_USERS = [
//     {
//         id: 'u1',
//         name: 'Joe Blog',
//         email: 'joe@gmail.com',
//         password: 'test'
//     },
// ]

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError("No Users in DB", 500);
    return next(error);
  }
  res.json({ users: users.map((u) => u.toObject({ getters: true })) }); // convert MDB obj array to JS obj array
};

// SIGN UP
// =======
const signup = async (req, res, next) => {
  // Express-Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError("Invalid Inputs", 402);
    return next(error);
  }

  const { name, email, password } = req.body;

  let alreadyUser;
  try {
    alreadyUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Sign Up Failed", 500);
    return next(error);
  }

  if (alreadyUser) {
    const error = new HttpError(
      "Could Not Create User. Email already exists",
      422
    );
    return next(error);
  }
  // Encrypt password
  let hashedPassword;
  const salt = 12;
  try {
    hashedPassword = await bcrypt.hash(password, salt);
  } catch (err) {
    const error = new HttpError("Server Login Error", 500);
    return next(error);
  }
  
  // Set up new user as Mongoose model object
  const newUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });
 // save to MDB with Mongoose 
  try {
    await newUser.save();
  } catch (err) {
    const error = new HttpError("Failed to Set Up User", 500);
    return next(error);
  }

  // set up jwt authorization token with parts: 1) payload, 2) private key that stays on server, 3) expiry option.
  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      "Private__KEY",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Login Server Failure. Try Again.", 500);
    return next(error);
  }

  res
    .status(201)
    .json({ userId: newUser.id, email: newUser.email, token: token });
};

// LOGIN
// =====
const login = async (req, res, next) => {
  const { email, password } = req.body;

  let alreadyUser;
  try {
    alreadyUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Login Failed", 500);
    return next(error);
  }

  if (!alreadyUser) {
    const error = new HttpError("Invalid Login Inputs", 401);
    return next(error);
  }

  // PASSWORD CHECK
  // ==============

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, alreadyUser.password);
  } catch (err) {
    const error = new HttpError("Login Incorrect. Try Again.", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid Password", 401);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: alreadyUser.id, email: alreadyUser.email },
      "Private__KEY",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Login Server Failure. Try Again.", 500);
    return next(error);
  }

  res.status(201).json({
    message: "Logged In",
    userId: alreadyUser.id,
    email: alreadyUser.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
