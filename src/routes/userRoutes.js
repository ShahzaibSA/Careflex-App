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
  handleEmailUpdate
} = require('../controllers/userCtrls');
const { authenticate } = require('../middlewares/auth');
const { validateRequiredBodyFields } = require('../middlewares/validateFields');

const router = express.Router();

//!Signup
router.post(
  '/',
  validateRequiredBodyFields(['username', 'email', 'password', 'confirmPassword']),
  handleCreateUser
);

//! Email Verification
router.post('/verification', validateRequiredBodyFields(['code']), handleVerifyEmail);

//! Login
router.post('/login', validateRequiredBodyFields(['email', 'password']), handleLoginUser);

//! Get User
router.get('/', authenticate, handleGetUser);

//! Email Update OTP
router.post(
  '/email-update-otp',
  validateRequiredBodyFields(['email']),
  authenticate,
  handleGenerateEmailUpdateOTP
);

//! Update Email
router.patch(
  '/email-update',
  validateRequiredBodyFields(['email', 'code']),
  authenticate,
  handleEmailUpdate
);

//! Update User
router.patch('/', validateRequiredBodyFields(['username']), authenticate, handleUpdateUser);

//! Update Password
router.patch(
  '/update-password',
  validateRequiredBodyFields(['currentPassword', 'newPassword', 'confirmPassword']),
  authenticate,
  handleUpdatePassword
);

//! Logout User
router.post('/logout', authenticate, handleLogoutUser);

//! Logout other devices
router.post('/logout-all', authenticate, handleLogoutAll);

//! Delete User
router.delete('/', validateRequiredBodyFields(['password']), authenticate, handleDeleteUser);

//! Forgot Password
router.post('/forgot-password', handleForgotPassword);

//! Reset Password
router.post('/reset-password', handleResetPassword);

module.exports = router;
