'use strict';

const { BadRequestException } = require('../exceptions');
const Timesheet = require('../models/timesheet.model');
const { shiftIdSchema } = require('../validations/timesheet.validation');

//! Get Submitted Timesheets >> HOME
const handleGetSubmittedTimesheets = async function (req, res, next) {
  try {
    const timesheet = await Timesheet.find({ shiftCreatedBy: req.user._id, submitted: true }).populate('shiftId');
    if (!timesheet.length) {
      return next(new BadRequestException('No submitted timesheets found.'));
    }
    res.status(200).json({ ok: true, data: { timesheet }, message: 'Timesheet successfully fetched.' });
  } catch (error) {
    next(error);
  }
};

const handleGetUnsubmittedTimesheets = async function (req, res, next) {
  try {
    const timesheet = await Timesheet.find({ applicantId: req.user._id, submitted: false }).populate('shiftId');
    if (!timesheet.length) {
      return next(new BadRequestException('No unsubmitted timesheets found.'));
    }
    res.status(200).json({ ok: true, data: { timesheet }, message: 'Timesheet successfully fetched.' });
  } catch (error) {
    next(error);
  }
};

const handleSubmitTimesheet = async function (req, res, next) {
  try {
    const { shiftId } = await shiftIdSchema.validateAsync(req.body);
    const timesheet = await Timesheet.findOne({ applicantId: req.user._id, shiftId });
    console.log(timesheet);
    if (!timesheet) {
      return next(new BadRequestException('Timesheet not found.'));
    }
    if (timesheet.submitted) {
      return next(new BadRequestException('Timesheet already submitted.'));
    }
    timesheet.submitted = true;
    await timesheet.save();
    res.status(200).json({ ok: true, data: { timesheet }, message: 'Timesheet successfully submitted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleGetSubmittedTimesheets, handleSubmitTimesheet, handleGetUnsubmittedTimesheets };
