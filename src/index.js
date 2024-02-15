'use strict';
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const connectDB = require('./db');
const userRoutes = require('./routes/userRoutes');

const port = process.env.PORT || 5000;
const app = express();

app.set('trust proxy', 1); // trust first proxy
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

//! API ROUTES
app.use('/v1/users', userRoutes);

app.use((error, req, res, next) => {
  console.log('index-----error', error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

//! DATABASE CONNECTION
connectDB();

app.use((error, req, res, next) => {
  console.log('index-----error', error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//! Server Starting
app.listen(port, () => console.log('Server is Running on port', port));
