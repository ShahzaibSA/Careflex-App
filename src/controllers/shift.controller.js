'use strict';

require('dotenv').config();

const { BadRequestException } = require('../exceptions');
const Application = require('../models/application.model');
const Shift = require('../models/shift.model');
const {
  shiftSchema,
  applyShiftSchema,
  shiftIdSchema,
  userIdSchema,
  statusChangeSchema,
  shiftApplicantSchema,
} = require('../validations/shift.validation');

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

//! Get Applications of the Shift
const handleGetApplicationsByShiftId = async function (req, res, next) {
  const shiftCreatedBy = req.user._id;
  try {
    const { shiftId, status } = await shiftApplicantSchema.validateAsync(req.query);

    let aggregate;
    if (status) {
      aggregate = { shiftCreatedBy, shift: shiftId, status };
    } else {
      aggregate = { shiftCreatedBy, shift: shiftId };
    }

    const applications = await Application.find(aggregate).sort({ createdAt: -1 }).populate('applicant shift');

    if (!applications.length) {
      return next(new BadRequestException('No applicants found for this shift.'));
    }

    const shift = applications[0]?.shift;

    const applications2 = await Application.find(aggregate);

    const applicants = applications.map((application, index) => {
      if (String(applications2[index].applicant._id) === String(application.applicant._id)) {
        return {
          _id: application.applicant._id,
          role: application.applicant.role,
          username: application.applicant.username,
          email: application.applicant.email,
          status: applications2[index].status,
          // createdAt: application.applicant.createdAt,
          // updatedAt: application.applicant.updatedAt,
        };
      }
    });

    res.status(200).json({
      ok: true,
      data: { shift, applications: applicants },
      message: 'All applications successfully fetched.',
    });
  } catch (error) {
    next(error);
  }
};

const handleApplicationStatus = async function (req, res, next) {
  const shiftCreatedBy = req.user._id;
  try {
    const { applicantId, status, shiftId } = await statusChangeSchema.validateAsync(req.body);
    const application = await Application.findOne({ shiftCreatedBy, shift: shiftId, applicant: applicantId });

    if (!application) {
      return next(new BadRequestException('No application found for  this shift.'));
    }
    if (application.status === status) {
      return next(new BadRequestException(`You have already marked the application as '${status}'.`));
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      ok: true,
      data: { application },
      message: 'Application status successfully changed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateShift,
  handleGetAllShifts,
  handleApplyShift,
  handleGetApplicationsByShiftId,
  handleApplicationStatus,
  // handleGetShiftsApplicants,
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
