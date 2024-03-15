'use strict';
const express = require('express');
const isCareHomeUser = require('../middlewares/isCareHomeUser');
const isCareGiverUser = require('../middlewares/isCareGiverUser');
const {
  handleCreateShift,
  handleGetAllShifts,
  handleApplyShift,
  handleGetShiftsApplicants,
} = require('../controllers/shift.controller');

const router = express.Router();

router.post('/', isCareHomeUser, handleCreateShift);

router.get('/', handleGetAllShifts);

router.post('/apply', isCareGiverUser, handleApplyShift);

router.get('/applicants', isCareHomeUser, handleGetShiftsApplicants);

module.exports = router;
