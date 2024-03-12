'use strict';
const express = require('express');
const authenticate = require('../middlewares/auth');
const { handleCreateShift } = require('../controllers/shift.controller');

const router = express.Router();

router.post('/', authenticate, handleCreateShift);

module.exports = router;
