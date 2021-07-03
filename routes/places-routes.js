const express = require('express');

const HttpError = require('../models/http-error');

const placeControllers = require('../controllers/places-controllers');

const router = express.Router();




// ROUTES
// ------
router.get('/:pid', placeControllers.getPlaceById);

router.get('/user/:uid', placeControllers.getPlaceByUserId);

router.post('/', placeControllers.createPlace);

module.exports = router;