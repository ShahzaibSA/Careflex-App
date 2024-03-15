'use strict';

const mongoose = require('mongoose');

// Function to validate if a string is a valid ObjectId
module.exports = function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
};
