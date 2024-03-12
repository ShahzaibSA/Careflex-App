'use strict';
const express = require('express');
const { handleCreateShift } = require('../controllers/shift.controller');
const isCareHomeUser = require('../middlewares/isCareHomeUser');

const router = express.Router();

router.post('/', isCareHomeUser, handleCreateShift);

module.exports = router;
