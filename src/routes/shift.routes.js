'use strict';
const express = require('express');
const isCareHomeUser = require('../middlewares/isCareHomeUser');
const isCareGiverUser = require('../middlewares/isCareGiverUser');
const {
  handleCreateShift,
  handleGetAllShifts,
  handleApplyShift,
  handleGetApplicantsByShiftId,
  handleGetCancelledShift,
} = require('../controllers/shift.controller');

const router = express.Router();

router.get('/', handleGetAllShifts);

router.post('/', isCareHomeUser, handleCreateShift);

router.get('/applicants/:shiftId', isCareHomeUser, handleGetApplicantsByShiftId);

router.get('/cancelled/:shiftId', isCareHomeUser, handleGetCancelledShift);

router.post('/apply', isCareGiverUser, handleApplyShift);

// router.get('/applicants', isCareHomeUser, handleGetShiftsApplicants);

module.exports = router;
