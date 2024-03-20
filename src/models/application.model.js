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
    required: true,
    default: 'APPLIED',
    enum: ['APPLIED', 'CANCELLED', 'REJECTED', 'APPROVED'],
  },
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
