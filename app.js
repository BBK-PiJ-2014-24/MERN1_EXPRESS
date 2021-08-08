const fs = require("fs");
const path = require("path");
const express = require("express");
const HttpError = require("./models/http-error");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();

// MongoDB config
// --------------
const url =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3ygns.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const connectConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

app.use(express.json()); // get any data found in the body of the request and convert to Json.

// WorkAround to Avoid CORS error
// ------------------------------
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

// Routes
// ------
// app.use("/uploads/images", express.static(path.join(__dirname, "images"))); // static serving of a file
app.use(
  "/uploads/images",
  express.static("/home/stewart/MERN1_EXPRESS/uploads/images")
);
// console.log(path.join(__dirname, "uploads", "images"));
app.use("/api/places/", placesRoutes); // routes are now part of middleware
app.use("/api/users/", usersRoutes); // routes are now part of middleware

// Errors
//-------
// 404
app.use((req, res, next) => {
  throw new HttpError("Page Not Found", 404);
});

// 500 -  server encountered an unexpected condition that prevented it from fulfilling the request
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }

  // Error middleware, detected by Express as it has 4 arguments
  // check first if res has already been sent to the client
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "Unknown Error" });
});

mongoose
  .connect(url, connectConfig)
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => console.log(err));
