'use strict';
const express = require('express');
const isCareHomeUser = require('../middlewares/isCareHomeUser');
const { handleCreateShift, handleGetAllShifts } = require('../controllers/shift.controller');

const router = express.Router();

router.post('/', isCareHomeUser, handleCreateShift);

router.get('/', handleGetAllShifts);

module.exports = router;
