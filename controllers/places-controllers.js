const {validationResult} = require('express-validator');
const {v4: uuidv4} = require('uuid');

const getCoordsForAddress = require('../util/location');
const HttpError = require('../models/http-error');


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
const getPlaceById = (req, res, next) => {
    // console.log('a GET request from Places')
    const placeId = req.params.pid;
    const place = DUMMY_VARIABLES.find( p=> p.id === placeId);

    if(!place){
    //   const error = new Error('No Place Found');
    //   error.code = 404;
    //   throw(error);  // throw error if sync code. Best pratice is to use next().
         throw new HttpError('No Place Found', 404);
    }
    res.json({place: place});
}

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const places = DUMMY_VARIABLES.filter( p => p.creator === userId); // find() only returns the first match

    if(!places || places.length === 0){
      const error = new HttpError('No Places Found with user id', 404);
      return next(error);
    }
    res.json({places: places});
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

    const createPlace = {
        id: uuidv4(),
        title, 
        description, 
        location: coordinates, 
        address, 
        creator
    };  
    DUMMY_VARIABLES.push(createPlace);
    res.status(201).json({place: createPlace});
}

// UPDATE/PATCH
// ------------
const updatePlace = (req, res, next) => {
    // Express-Validation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        throw new HttpError('Invalid Inputs', 402);
    }

    const placeId = req.params.pid;
    const {title, description } = req.body;
    
    const updatedPlace = { ...DUMMY_VARIABLES.find( p => p.id === placeId)}; // create copy coz of async issues
    updatedPlace.title = title;
    updatedPlace.description = description;
    
    const placeIndex = DUMMY_VARIABLES.findIndex( p => p.id === placeId); // find index of updated place 
    DUMMY_VARIABLES[placeIndex] = updatedPlace; // update orginal array

    res.status(200).json({place: updatedPlace}); // send res with body

}


// DELETE
// ------
const deletePlace = (req, res, next) => {

    const placeId = req.params.pid;

    if(!DUMMY_VARIABLES.find(p => p.id === placeId)){
        throw new HttpError('Place Does Not Exist', 404);
    }


    DUMMY_VARIABLES = DUMMY_VARIABLES.filter(p => p.id !== placeId);

    res.status(200).json({message: 'Deleted Place'});

}


//  Exports
// --------
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;