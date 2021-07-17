const {validationResult} = require('express-validator');
const {v4: uuidv4} = require('uuid');

const getCoordsForAddress = require('../util/location');
const HttpError = require('../models/http-error');

const Place = require('../models/place'); // Mongoose Model Object



let DUMMY_VARIABLES = [
    {
        id: 'p1',
        title: 'Empire State Buiding',
        description: 'Sky scraper',
        location: {
            lat:  40.7484474,
            lng: -73.9871516
        },
        address: '20 W 34th St, New York, NY 10001, United States',
        creator: 'u1'
    }
];

// Router Middleware callbacks
// ============================

// GET
// ---
const getPlaceById = async (req, res, next) => {
    // console.log('a GET request from Places')
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch(err) {
        const error = new HttpError('Cannot find in DB', 500);
        return next(error);
    }

    if(!place){
        const error = new HttpError('No Place Found', 404);
        return next(error);  
    }
    res.json({place: place.toObject( {getters: true})}); // covert from MDB obj to JS obj
}                                                        // getters drops underscore in id      

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    
    let places;
    try{
        places = await Place.find({creator: userId}); //mongoose returns an Array
    } catch(err) {
      const error = new HttpError('No Places Found in DB with user id', 500);
      return next(error);
    }

    if(!places || places.length === 0){
      const error = new HttpError('No Places Found with user id', 404);
      return next(error);
    }
    res.json({places: places.map(p => p.toObject({getters: true}))}); // convert Array to Obj 
}

// POST
// ----
const createPlace = async (req, res, next) => {
    // Express-Validation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid Inputs', 402));
    }

    const {title, description, address, creator} = req.body;

    let coordinates;
    try{
        coordinates = await getCoordsForAddress(address);
    } catch(err){
        return next(err);
    }

    // MongoDB obj for row insert using Model constructor
    const createPlace = new Place({
        title: title,
        description,
        address, 
        location: coordinates,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
        creator,
    });

    try {
        await createPlace.save(); // Mongo update
    } catch(err) {
        const error = new HttpError("DB insert failed",  500);
        return next(error);
    }

    res.status(201).json({place: createPlace});
}

// UPDATE/PATCH
// ------------
const updatePlace = async (req, res, next) => {
    // Express-Validation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new HttpError('Invalid Inputs', 402);
        return next(error);
    }

    const placeId = req.params.pid;
    const {title, description } = req.body;
    
    let updatedPlace;
    try{
        updatedPlace = await Place.findById(placeId); // returns a mongo obj
    } catch(err) {
        const error = new HttpError('Unable to find place in DB', 500);
        return next(error);
    }

    updatedPlace.title = title;
    updatedPlace.description = description;
    

    try {
        await updatedPlace.save();
    } catch(err){
        const error = new HttpError('Unable to update DB, 500');
        return next(error);
    }

    res.status(200).json({place: updatedPlace.toObject({getters: true})}); // send res with body

}


// DELETE
// ------
const deletePlace = async (req, res, next) => {

    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch(err) { 
        const error = new HttpError('Place Does Not Exist', 404);
        return next(error);
    }


    try {
        await place.remove();
    } catch(err) {
        const error = new HttpError('Place Could Not Be Deleted', 500);
        return next(error);
    }

    res.status(200).json({message: 'Deleted Place'});

}


//  Exports
// --------
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;