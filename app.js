const express = require('express');

const placesRoutes = require('./routes/places-routes');

const app = express();

app.use(express.json());  // get any data found in the body of the request



app.use('/api/places/', placesRoutes); // routes are now part of middleware

// Error middleware, detected by Express as it has 4 arguments
app.use((error, req, res, next) => {
    // check first if res has already been sent to the client
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'Unknown Error'})

});


app.listen(5000);