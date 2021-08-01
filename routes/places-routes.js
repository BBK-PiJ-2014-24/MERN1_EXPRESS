const express = require("express");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");
const HttpError = require("../models/http-error");
const checkAuth = require("../middleware/check-auth");

const placeControllers = require("../controllers/places-controllers");

const router = express.Router();

// Express Validator
// -----------------
const validationCheckPost = [
  check("title").not().isEmpty(),
  check("description").isLength({ min: 5 }),
  check("address").not().isEmpty(),
];

const validationCheckPatch = [
  check("title").not().isEmpty(),
  check("description").isLength({ min: 5 }),
];

// ROUTES
// ------
router.get("/:pid", placeControllers.getPlaceById);

router.get("/user/:uid", placeControllers.getPlacesByUserId);

//Token Check for all other endpoints
router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  validationCheckPost,
  placeControllers.createPlace
);

router.patch("/:pid", validationCheckPatch, placeControllers.updatePlace);

router.delete("/:pid", placeControllers.deletePlace);

module.exports = router;
