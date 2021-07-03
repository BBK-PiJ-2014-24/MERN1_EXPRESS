
const {v4: uuidv4} = require('uuid');

const HttpError = require('../models/http-error');


const DUMMY_VARIABLES = [
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
// ---------------------------
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


const getPlaceByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const place = DUMMY_VARIABLES.find( p => p.creator === userId);

    if(!place){
      const error = new HttpError('No Place Found with user id', 404);
      return next(error);
    }
    res.json({place: place});
}

const createPlace = (req, res, next) => {

    const {title, description, coordinates, address, creator} = req.body;

    console.log(creator);
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



//  Exports
// --------
exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;