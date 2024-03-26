'use strict';

const { BadRequestException } = require('../exceptions');
const Timesheet = require('../models/timesheet.model');
const { shiftIdSchema, timesheetStatus, timesheetStatusSchema } = require('../validations/timesheet.validation');

//! Get Submitted Timesheets >> HOME
const handleGetSubmittedTimesheets = async function (req, res, next) {
  try {
    const { status } = await timesheetStatus.validateAsync(req.query);
    let aggregate;
    if (status === 'APPROVED' || status === 'REJECTED' || status === 'PENDING') {
      aggregate = { shiftCreatedBy: req.user._id, submitted: true, status };
    } else {
      aggregate = { shiftCreatedBy: req.user._id, submitted: true };
    }
    const timesheet = await Timesheet.find(aggregate).sort({ createdAt: -1 }).populate('shift applicant');
    if (!timesheet.length) {
      return next(new BadRequestException('No submitted timesheets found.'));
    }
    res.status(200).json({ ok: true, data: { timesheet }, message: 'Timesheet successfully fetched.' });
  } catch (error) {
    next(error);
  }
};

//! Approve or Reject Submitted Timesheets >> HOME
const handleApproveOrRejectSubmittedTimesheet = async function (req, res, next) {
  try {
    const shiftCreatedBy = req.user._id;
    const { status, applicantId, shiftId } = await timesheetStatusSchema.validateAsync(req.body);
    const timesheet = await Timesheet.findOne({ shiftCreatedBy, applicant: applicantId, shift: shiftId });
    if (!timesheet) {
      return next(new BadRequestException('Timesheet not found.'));
    }
    if (timesheet.status === status) {
      return next(new BadRequestException(`Timesheet already ${status}`));
    }
    timesheet.status = status;
    await timesheet.save();
    res.status(200).json({ ok: true, data: { timesheet }, message: `Timesheet ${status}` });
  } catch (error) {
    next(error);
  }
};

//* Get Unsubmitted Timesheets >> GIVER
const handleGetUnsubmittedTimesheets = async function (req, res, next) {
  try {
    const timesheet = await Timesheet.find({ applicant: req.user._id, submitted: false })
      .sort({ createdAt: -1 })
      .populate('shift');
    if (!timesheet.length) {
      return next(new BadRequestException('No unsubmitted timesheets found.'));
    }
    res.status(200).json({ ok: true, data: { timesheet }, message: 'Timesheet successfully fetched.' });
  } catch (error) {
    next(error);
  }
};

//* Submit Timesheet >> GIVER
const handleSubmitTimesheet = async function (req, res, next) {
  try {
    const { shiftId } = await shiftIdSchema.validateAsync(req.body);
    const timesheet = await Timesheet.findOne({ applicant: req.user._id, shift: shiftId });
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

module.exports = {
  handleGetSubmittedTimesheets,
  handleSubmitTimesheet,
  handleGetUnsubmittedTimesheets,
  handleApproveOrRejectSubmittedTimesheet,
};
