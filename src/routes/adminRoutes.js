'use strict';

const express = require('express');

const { authenticate, admin } = require('../middlewares/auth');
const { validateRequiredQueryFields } = require('../middlewares/validateFields');
const { handleGetAllUser } = require('../controllers/adminCtrls');

const router = express.Router();

router.get(
  '/users',
  // validateRequiredQueryFields(['role']),
  authenticate,
  admin,
  handleGetAllUser
);

module.exports = router;
