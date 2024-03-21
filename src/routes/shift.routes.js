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
} = require('../controllers/shift.controller');

const router = express.Router();

router.get('/', handleGetAllShifts);

router.post('/', isCareHomeUser, handleCreateShift);

router.get('/applications', isCareHomeUser, handleGetApplicationsByShiftId);

router.post('/application/status', isCareHomeUser, handleApplicationStatus);

router.post('/apply', isCareGiverUser, handleApplyShift);

// router.get('/applicants', isCareHomeUser, handleGetShiftsApplicants);

module.exports = router;
