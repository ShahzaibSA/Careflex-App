'use strict';

const { BadRequestException } = require('../exceptions');
const Timesheet = require('../models/timesheet.model');

const handleGetUnsubmittedTimesheets = async function (req, res, next) {
  try {
    const timesheet = await Timesheet.find({ applicantId: req.user._id, submitted: false }).populate('shiftId');
    if (!timesheet.length) {
      return next(new BadRequestException('No unsubmitted timesheets found.'));
    }
    res.status(201).json({ ok: true, data: { timesheet }, message: 'Timesheet successfully fetched.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleGetUnsubmittedTimesheets };
