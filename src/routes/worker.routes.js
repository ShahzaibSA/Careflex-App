'use strict';

const express = require('express');
const { handleGetWorkers } = require('../controllers/worker.controller');
const isCareHomeUser = require('../middlewares/isCareHomeUser');
const router = express.Router();

router.get('/today', isCareHomeUser, handleGetWorkers);

module.exports = router;
