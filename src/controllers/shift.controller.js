'use strict';

require('dotenv').config();

const { BadRequestException } = require('../exceptions');
const Application = require('../models/application.model');
const Shift = require('../models/shift.model');
const shiftValidaiton = require('../validations/shift.validation');

//! Create Shift
const handleCreateShift = async function (req, res, next) {
  try {
    const user = req.user;
    const body = await shiftValidaiton.validateAsync(req.body);
    const shift = await Shift.create({ ...body, uid: user._id });
    delete shift._id;
    delete shift.__v;
    res.status(200).json({ ok: true, data: { shift }, message: 'Shift successfully created.' });
  } catch (error) {
    next(error);
  }
};

//! Get All Shifts
const handleGetAllShifts = async function (req, res, next) {
  try {
    const shifts = await Shift.find().sort({ createdAt: -1 }).exec();
    delete shifts?._id;
    delete shifts?.__v;
    res.status(200).json({ ok: true, data: { shifts }, message: 'All Shifts successfully fetched.' });
  } catch (error) {
    next(error);
  }
};

const handleApplyShift = async function (req, res, next) {
  const user = req.user;
  const shiftId = req.body.shiftId;
  try {
    const shiftAlreadyApplied = await Application.findOne({ shift: shiftId, user: user._id });
    if (shiftAlreadyApplied) {
      return next(new BadRequestException('You Already applied to this shift'));
    }

    const application = new Application({ shift: shiftId, user: user._id });
    await application.save();

    res.status(200).json({ ok: true, data: { application }, message: 'Successfully applied for this shift.' });
  } catch (error) {
    next(error);
  }
};

const handleGetShiftsApplicants = async function (req, res, next) {
  try {
    const data = await Application.find().sort({ createdAt: -1 }).populate('user shift');
    if (!data.length) {
      return res.status(200).json({ ok: false, message: 'No applicants found for this shift.' });
    }

    const applications = data.map((application) => {
      return { user: application.user, shift: application.shift };
    });

    res
      .status(200)
      .json({ ok: true, data: { applications }, message: 'All shifts and applicants successfully fetched.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateShift,
  handleGetAllShifts,
  handleApplyShift,
  handleGetShiftsApplicants,
};
