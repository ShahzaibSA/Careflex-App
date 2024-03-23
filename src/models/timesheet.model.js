'use strict';

const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
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
