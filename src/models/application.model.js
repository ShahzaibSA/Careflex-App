'use strict';

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
  },
  shiftCreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'CANCELLED', 'REJECTED', 'APPROVED'],
  },
  shiftCompleted: {
    type: Boolean,
    default: false,
  },
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
