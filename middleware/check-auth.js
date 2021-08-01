const { JsonWebTokenError } = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // attach token to header, Authorization: 'Bearer #TOKEN

  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Missing Token");
    }
    const decodedToken = jwt.verify(token, "Private__KEY");
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError("Token Authentication Error", 401);
    return next(error);
  }
};
