'use strict';
const express = require('express');
const isCareHomeUser = require('../middlewares/isCareHomeUser');
const isCareGiverUser = require('../middlewares/isCareGiverUser');
const {
  handleCreateShift,
  handleGetAllShifts,
  handleApplyShift,
  handleGetApplicantsByShiftId,
  // handleGetShiftsApplicants,
} = require('../controllers/shift.controller');

const router = express.Router();

router.post('/', isCareHomeUser, handleCreateShift);

router.get('/', handleGetAllShifts);

router.get('/applicants/:shiftId', isCareHomeUser, handleGetApplicantsByShiftId);

router.post('/apply', isCareGiverUser, handleApplyShift);

// router.get('/applicants', isCareHomeUser, handleGetShiftsApplicants);

module.exports = router;
