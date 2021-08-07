const { JsonWebTokenError } = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  // Defence check if client sends an OPTIONS req first
  if(req.method === 'OPTIONS'){
      return next();
  }
  // attach token to header, Authorization: 'Bearer #TOKEN
  try {
    const token = req.headers.authorization.split(" ")[1]; // get token
    if (!token) {
      throw new Error("Missing Token");
    }
    const decodedToken = jwt.verify(token, "Private__KEY"); // verify private key and decode with private key
    req.userData = { userId: decodedToken.userId };  // Add decryted payload to the req, which will now be passed to other objects
    next(); // pass on to the next middleware route.
  } catch (err) {
    const error = new HttpError("Token Authentication Error", 401);
    return next(error);
  }
};
