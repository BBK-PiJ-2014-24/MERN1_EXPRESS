const express = require('express');
const HttpError = require('./models/http-error');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');

const app = express();

// MongoDB config
// --------------
const url = 'mongodb+srv://user1:Edcrfv123@cluster0.3ygns.mongodb.net/place?retryWrites=true&w=majority';
const connectConfig = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
   };

app.use(express.json());  // get any data found in the body of the request and convert to Json.

// Routes
// ------
app.use('/api/places/', placesRoutes); // routes are now part of middleware
app.use('/api/users/', usersRoutes); // routes are now part of middleware

// Errors
//-------
// 404
app.use((req, res, next) => {
   throw  new HttpError('Page Not Found', 404);
})

// 500 -  server encountered an unexpected condition that prevented it from fulfilling the request
app.use((error, req, res, next) => {
    // Error middleware, detected by Express as it has 4 arguments
    // check first if res has already been sent to the client
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'Unknown Error'})

});

mongoose.connect(url, connectConfig)
    .then(()=> {app.listen(5000);})
    .catch(err => console.log(err));
