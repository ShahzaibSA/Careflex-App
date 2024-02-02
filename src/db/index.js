'use stricts';
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = function () {
  const url = process.env.MONGO_URL;

  try {
    mongoose.connect(url);
  } catch (err) {
    console.error('DB ERROR', err.message);
    process.exit(1);
  }
  const dbConnection = mongoose.connection;
  dbConnection.once('open', () => console.log(`Database connected`));

  dbConnection.on('error', (err) => console.error(`connection error: ${err}`));
  return;
};

module.exports = connectDB;
