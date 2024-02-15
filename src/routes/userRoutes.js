'use strict';
const express = require('express');

const {
  handleCreateUser,
  handleLoginUser,
  handleGetUser,
  handleUpdateUser,
  handleUpdatePassword,
  handleLogoutUser,
  handleLogoutAll,
  handleDeleteUser,
  handleForgotPassword,
  handleResetPassword
} = require('../controllers/userCtrls');
const authenticate = require('../middlewares/auth');
const validateRequiredFields = require('../middlewares/validateFields');

const router = express.Router();

//!Signup
router.post(
  '/',
  validateRequiredFields(['username', 'email', 'password', 'confirmPassword']),
  handleCreateUser
);

//! Reset Password
// router.post('/verification', handleUserEmailVerification);

//! Login
router.post('/login', validateRequiredFields(['email', 'password']), handleLoginUser);

//! Get User
router.get('/', authenticate, handleGetUser);

//! Update User
router.patch(
  '/',
  validateRequiredFields(['username', 'email']),
  authenticate,
  handleUpdateUser
);

//! Update User
router.patch(
  '/update-password',
  validateRequiredFields(['currentPassword', 'newPassword', 'confirmPassword']),
  authenticate,
  handleUpdatePassword
);

//! Logout User
router.post('/logout', authenticate, handleLogoutUser);

//! Logout other devices
router.post('/logout-all', authenticate, handleLogoutAll);

//! Delete User
router.delete('/', validateRequiredFields(['password']), authenticate, handleDeleteUser);

//! Forgot Password
router.post('/forgot-password', handleForgotPassword);

//! Reset Password
router.post('/reset-password', handleResetPassword);

module.exports = router;
