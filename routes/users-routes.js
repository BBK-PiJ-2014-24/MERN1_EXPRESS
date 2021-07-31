const express = require("express");
const { check } = require("express-validator");

const HttpError = require("../models/http-error");
const usersControllers = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");

// Express Validator
// -----------------
const validationSignUp = [
  check("name").not().isEmpty(),
  check("email").normalizeEmail().isEmail(),
  check("password").isLength({ min: 6 }),
];

// ROUTES
// ------
const router = express.Router();

router.get("/", usersControllers.getUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  validationSignUp,
  usersControllers.signup
);

router.post("/login", usersControllers.login);

module.exports = router;
