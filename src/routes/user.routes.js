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

const router = express.Router();

//!Signup
router.post('/', handleCreateUser);

//! Email Verification
router.post('/verification', handleVerifyEmail);

//! Login
router.post('/login', handleLoginUser);

//! Get User
router.get('/', authenticate, handleGetUser);

//! Email Update OTP
router.post('/email-update-otp', authenticate, handleGenerateEmailUpdateOTP);

//! Update Email
router.patch('/email-update', authenticate, handleEmailUpdate);

//! Update User
router.patch('/', authenticate, handleUpdateUser);

//! Update Password
router.patch('/update-password', authenticate, handleUpdatePassword);

//! Logout User
router.post('/logout', authenticate, handleLogoutUser);

//! Logout other devices
router.post('/logout-all', authenticate, handleLogoutAll);

//! Delete User
router.delete('/', authenticate, handleDeleteUser);

//! Forgot Password
router.post('/forgot-password', handleForgotPassword);

//! Reset Password
router.post('/reset-password', handleResetPassword);

module.exports = router;
