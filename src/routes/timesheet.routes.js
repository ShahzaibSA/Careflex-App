'use strict';

const express = require('express');
const router = express.Router();

const { handleGetUnsubmittedTimesheets } = require('../controllers/timesheet.controller');
const isCareGiverUser = require('../middlewares/isCareGiverUser');

router.get('/unsubmitted', isCareGiverUser, handleGetUnsubmittedTimesheets);

module.exports = router;
