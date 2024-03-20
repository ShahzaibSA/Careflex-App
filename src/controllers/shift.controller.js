'use strict';

require('dotenv').config();

const { BadRequestException } = require('../exceptions');
const Application = require('../models/application.model');
const Shift = require('../models/shift.model');
const { shiftSchema, applyShiftSchema, shiftIdSchema, userIdSchema } = require('../validations/shift.validation');

//! Create Shift
const handleCreateShift = async function (req, res, next) {
  try {
    const user = req.user;
    const body = await shiftSchema.validateAsync(req.body);
    const shift = await Shift.create({ ...body, shiftCreatedBy: user._id });
    delete shift._id;
    delete shift.__v;
    res.status(200).json({ ok: true, data: { shift }, message: 'Shift successfully created.' });
  } catch (error) {
    next(error);
  }
};

//! Get All Shifts for HOME
const handleGetAllShifts = async function (req, res, next) {
  let shifts;
  try {
    const { shiftCreatedBy } = await userIdSchema.validateAsync(req.query);
    if (shiftCreatedBy) {
      shifts = await Shift.find({ shiftCreatedBy }).sort({ createdAt: -1 }).exec();
    } else {
      shifts = await Shift.find().sort({ createdAt: -1 }).exec();
    }
    res.status(200).json({ ok: true, data: { shifts }, message: 'All Shifts successfully fetched.' });
  } catch (error) {
    next(error);
  }
};

//! Apply for Shift
const handleApplyShift = async function (req, res, next) {
  const user = req.user;
  try {
    const { shiftId, shiftCreatedBy } = await applyShiftSchema.validateAsync(req.body);
    const shift = await Shift.findOne({ _id: shiftId });
    if (!shift) {
      return next(new BadRequestException('Shift does not exist.'));
    }

    const shiftAlreadyApplied = await Application.findOne({ shift: shiftId, applicant: user._id });
    if (shiftAlreadyApplied) {
      return next(new BadRequestException('You Already applied to this shift'));
    }

    const application = new Application({ shift: shiftId, applicant: user._id, shiftCreatedBy });
    await application.save();

    res.status(200).json({ ok: true, data: { application }, message: 'Successfully applied for this shift.' });
  } catch (error) {
    next(error);
  }
};

//! Get Applicant of the Shift
const handleGetApplicantsByShiftId = async function (req, res, next) {
  const shiftCreatedBy = req.user._id;
  try {
    const { shiftId } = await shiftIdSchema.validateAsync(req.params);
    const applications = await Application.find({ shiftCreatedBy, shift: shiftId })
      .sort({ createdAt: -1 })
      .populate('applicant shift');

    if (!applications.length) {
      return next(new BadRequestException('No applicants found for this shift.'));
    }

    const shift = applications[0]?.shift;
    const applicants = applications.map((application) => application.applicant);

    res.status(200).json({
      ok: true,
      data: { shift, applicants },
      message: 'All Applicants successfully fetched.',
    });
  } catch (error) {
    next(error);
  }
};

// const handleGetShiftsApplicants = async function (req, res, next) {
//   try {
//     const data = await Application.find({ user: req.user }).sort({ createdAt: -1 }).populate('user shift');
//     if (!data.length) {
//       return res.status(200).json({ ok: false, message: 'No applicants found for this shift.' });
//     }

//     const applications = data.map((application) => {
//       return { user: application.user, shift: application.shift };
//     });

//     res
//       .status(200)
//       .json({ ok: true, data: { applications }, message: 'All shifts and applicants successfully fetched.' });
//   } catch (error) {
//     next(error);
//   }
// };

module.exports = {
  handleCreateShift,
  handleGetAllShifts,
  handleApplyShift,
  handleGetApplicantsByShiftId,
  // handleGetShiftsApplicants,
};
