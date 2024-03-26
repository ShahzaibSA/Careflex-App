'use strict';

const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
      required: true,
    },
    shiftCreatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    submitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Timesheet = mongoose.model('Timesheet', timesheetSchema);

module.exports = Timesheet;
