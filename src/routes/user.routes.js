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
  handleResetPassword,
  handleVerifyEmail,
  handleGenerateEmailUpdateOTP,
  handleEmailUpdate,
} = require('../controllers/user.controller');
const authenticate = require('../middlewares/auth');
const validateRequiredFields = require('../middlewares/validateFields');

const router = express.Router();

//!Signup
router.post('/', validateRequiredFields(['username', 'email', 'password', 'confirmPassword']), handleCreateUser);

//! Email Verification
router.post('/verification', validateRequiredFields(['code']), handleVerifyEmail);

//! Login
router.post('/login', validateRequiredFields(['email', 'password']), handleLoginUser);

//! Get User
router.get('/', authenticate, handleGetUser);

//! Email Update OTP
router.post('/email-update-otp', validateRequiredFields(['email']), authenticate, handleGenerateEmailUpdateOTP);

//! Update Email
router.patch('/email-update', validateRequiredFields(['email', 'code']), authenticate, handleEmailUpdate);

//! Update User
router.patch('/', validateRequiredFields(['username']), authenticate, handleUpdateUser);

//! Update Password
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
