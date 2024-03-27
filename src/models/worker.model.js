'use strict';

const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Shift',
    },
    shiftCreatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    shiftDate: {
      type: Date,
      required: true,
    },
  },
  // { timestamps: true }
);

const Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;
