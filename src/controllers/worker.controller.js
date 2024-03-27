'use strict';

const { ForbiddenExpception } = require('../exceptions');
const Worker = require('../models/worker.model');

const handleGetWorkers = async function (req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Convert dates to UTC strings for comparison
    const todayUTC = today.toISOString().split('T')[0];
    const tomorrowUTC = tomorrow.toISOString().split('T')[0];

    const workers = await Worker.find({
      shiftDate: {
        $gte: todayUTC,
        $lt: tomorrowUTC,
      },
    }).populate('applicant');

    console.log(workers);
    console.log(String(workers[0]?.shiftCreatedBy), String(req.user._id));
    console.log(String(workers[0]?.shiftCreatedBy) !== String(req.user._id));
    if (String(workers[0]?.shiftCreatedBy) !== String(req.user._id)) {
      return next(new ForbiddenExpception('You are not authorized to view the workers of this shift.'));
    }

    res.status(200).json({ ok: true, data: { workers }, message: 'Workers successfully fetched.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleGetWorkers };
