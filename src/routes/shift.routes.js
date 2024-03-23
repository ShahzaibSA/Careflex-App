'use strict';
const express = require('express');
const isCareHomeUser = require('../middlewares/isCareHomeUser');
const isCareGiverUser = require('../middlewares/isCareGiverUser');
const {
  handleCreateShift,
  handleGetAllShifts,
  handleApplyShift,
  handleGetApplicationsByShiftId,
  handleApplicationStatus,
  handleShiftCompletion,
} = require('../controllers/shift.controller');

const router = express.Router();

//! Create Shift >> HOME
router.post('/', isCareHomeUser, handleCreateShift);

//! Get Applications of the Shift >> HOME
router.get('/applications', isCareHomeUser, handleGetApplicationsByShiftId);

//! Change Application Status >> HOME
router.post('/application/status', isCareHomeUser, handleApplicationStatus);

//* Apply for Shift >> GIVER
router.post('/apply', isCareGiverUser, handleApplyShift);

//* Shift Completion >> GIVER
router.post('/complete', isCareGiverUser, handleShiftCompletion);

//< Get All Shifts >> HOME & GIVER
router.get('/', handleGetAllShifts);

// router.get('/applicants', isCareHomeUser, handleGetShiftsApplicants);

module.exports = router;
