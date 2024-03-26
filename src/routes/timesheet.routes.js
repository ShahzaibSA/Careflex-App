'use strict';

const express = require('express');
const router = express.Router();

const {
  handleSubmitTimesheet,
  handleGetUnsubmittedTimesheets,
  handleGetSubmittedTimesheets,
  handleApproveOrRejectSubmittedTimesheet,
} = require('../controllers/timesheet.controller');
const isCareGiverUser = require('../middlewares/isCareGiverUser');
const isCareHomeUser = require('../middlewares/isCareHomeUser');

//! Get Submitted Timesheets >> HOME
router.get('/submitted', isCareHomeUser, handleGetSubmittedTimesheets);

//! Approve or Reject Submitted Timesheets >> HOME
router.post('/status', isCareHomeUser, handleApproveOrRejectSubmittedTimesheet);

//* Get Unsubmitted Timesheets >> GIVER
router.get('/unsubmitted', isCareGiverUser, handleGetUnsubmittedTimesheets);

//* Create Timesheet >> GIVER
router.post('/submit', isCareGiverUser, handleSubmitTimesheet);

module.exports = router;
