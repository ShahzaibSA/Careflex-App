/* eslint-disable no-console */
'use strict';

const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');

const swaggerFile = require('../swagger-output.json');
const connectDB = require('./db');
const userRoutes = require('./routes/user.routes.js');
const job = require('./jobs/deleteUnverifiedUsers.js');

const port = process.env.PORT || 5000;
const app = express();

app.set('trust proxy', 1); // trust first proxy
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

//! Swagger Api Documentation
app.use('/api/v1/doc/', swaggerUi.serve, swaggerUi.setup(swaggerFile));

//! API ROUTES
app.use('/v1/users', userRoutes);

//! DATABASE CONNECTION
connectDB();

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//! Job to Delete Unverified User
job.start();
// console.log(job.nextDate());

//! Server Starting
app.listen(port, () => console.log('Server is Running on port', port));
