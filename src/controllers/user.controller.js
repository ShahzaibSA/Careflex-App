'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');

const User = require('../models/user.model');
const OTP = require('../models/otp.model');
const mailer = require('../utils/mailer');
const { generateOTP, validateCode } = require('../utils/otp');

//!Signup
const handleCreateUser = async function (req, res) {
  const { password, confirmPassword, email } = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(404).json({ ok: false, message: 'Password does not match!' });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(409).json({ ok: false, message: 'Email already exists' });
    }

    const user = new User(req.body);
    await user.save();

    const { code, secret } = generateOTP(user._id);
    await OTP.create({ code, secret, uid: user._id });

    const mailOptions = {
      from: process.env.MAILER_EMAIL,
      to: user.email,
      subject: 'Email Verification',
      html: `<p>Hello ${user.username.toUpperCase()} here's your <strong>${code}</strong> OTP to verify your email. </p>`,
    };

    await mailer(mailOptions);

    res.status(201).json({
      ok: true,
      message: `A verification OTP is sent to ${email}. Please verify your OTP.`,
      // message: 'A verification OTP is sent to your email address. Please verify your OTP.'
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

//! Verify OTP
const handleVerifyEmail = async function (req, res) {
  const userEnteredCode = req.body.code;
  try {
    const otp = await OTP.findOneAndDelete({ code: userEnteredCode });
    if (!otp || !validateCode(otp.secret, userEnteredCode)) {
      return res.status(400).json({ ok: false, message: 'Please enter a valid OTP.' });
    }

    const user = await User.findOne({ _id: otp.uid });
    if (!user) return res.status(400).json({ ok: false, error: 'Please sign up again.' });
    user.isEmailVerified = true;
    await user.save();

    const token = await user.generateToken();

    res.status(201).json({
      ok: true,
      token,
      user: user,
      message: 'Email successfully verified.',
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

//!Login
const handleLoginUser = async function (req, res) {
  const { email, password } = req.body;
  try {
    if (req.session?.user?.email === email) {
      return res.status(400).send({
        ok: false,
        message: 'An OTP is sent to your email address. Please verify it to continue!',
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ ok: false, message: 'No Account Found. Please Sign Up!' });
    }
    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      return res.status(400).json({ ok: false, message: 'Invalid Email or Password' });
    }

    const token = await user.generateToken();
    res.status(200).json({ ok: true, token, user });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

//! Get User
const handleGetUser = function (req, res) {
  try {
    res.status(200).json({
      ok: true,
      user: req.user,
      token: req.token,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

const handleGenerateEmailUpdateOTP = async function (req, res) {
  const { email } = req.body;
  const { user } = req;
  if (email === user.email) {
    return res.status(400).json({ ok: false, message: 'This email is your current email.' });
  }
  try {
    if (email !== user.email) {
      const emailExists = await User.findOne({ email: email });
      if (emailExists) {
        return res.status(400).json({ ok: false, message: 'The email already in use.' });
      }
    }

    const { code, secret } = generateOTP();

    await OTP.deleteMany({ uid: user._id });
    await OTP.create({ code, uid: user._id });

    const mailOptions = {
      from: process.env.MAILER_EMAIL,
      to: email,
      subject: 'Email Verification',
      html: `<p>Hello ${user.username.toUpperCase()} here's your <strong>${code}</strong> OTP to verify your email. </p>`,
    };
    await mailer(mailOptions);

    req.session.secret = secret;
    req.session.sessionEmail = email;
    req.session.save();

    res.status(200).json({
      ok: true,
      message: 'A verification OTP is sent to entered email address. Please verify your OTP.',
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

//! Email Update
const handleEmailUpdate = async function (req, res) {
  const { email, code } = req.body;
  const { user } = req;
  const { secret, sessionEmail } = req.session;

  if (!secret) return res.sendStatus(400);
  if (email === user.email) {
    return res.status(400).json({ ok: false, message: 'This email is your current email.' });
  }
  if (sessionEmail !== email) {
    return res.status(400).json({ ok: false, message: 'Invalid OTP verification.' });
  }

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ ok: false, message: 'The email already in use.' });
    }

    if (!validateCode(secret, code)) {
      return res.status(400).json({ ok: false, message: 'OTP is not valid.' });
    }

    await OTP.findOneAndDelete({ code, uid: user._id });

    user.email = email;
    user.tokens = user.tokens.filter((tokens) => tokens.token === req.token);
    await user.save();

    req.session.destroy();

    res.status(200).json({
      ok: true,
      message: 'Email successfully updated.',
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

//! Update User
const handleUpdateUser = async function (req, res) {
  const { body } = req;
  const user = req.user;
  try {
    const updates = Object.keys(body);
    const allowedUpdates = ['username'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).send({ ok: false, message: 'Invalid updates!' });
    }

    updates.forEach((update) => (req.user[update] = body[update]));
    await user.save();

    res.status(200).json({ ok: true, user, message: 'Profile successfully updated.' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

//! Update Password
const handleUpdatePassword = async function (req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = req.user;

    const passwordMatched = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatched) {
      return res.status(400).json({
        ok: false,
        message: 'Your current password was entered incorrectly.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ ok: false, message: 'New password does not match.' });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({
        ok: false,
        message: 'New password must be different from current password.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ ok: true, user, message: 'Password successfully updated.' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

//! Logout User
const handleLogoutUser = async function (req, res) {
  try {
    const { user } = req;
    user.tokens = user.tokens.filter((tokens) => tokens.token !== req.token);
    await user.save();
    res.status(200).json({ ok: true, message: 'User successfully Logged out.' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

//! Logout other devices
const handleLogoutAll = async function (req, res) {
  try {
    const { user } = req;
    user.tokens = user.tokens.filter((tokens) => tokens.token === req.token);
    await user.save();

    res.status(200).json({
      ok: true,
      message: 'All other devices successfully Logged out.',
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

const handleDeleteUser = async function (req, res) {
  try {
    const { password } = req.body;
    const user = req.user;

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      return res.status(400).json({ ok: false, message: 'Please enter your password correctly.' });
    }
    await User.deleteOne({ email: user.email });
    res.status(200).json({ ok: true, message: 'Account successfully deleted.' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

const handleForgotPassword = async function (req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ ok: false, message: 'No user found with this email.' });
    }

    const { code, secret } = generateOTP();

    await OTP.deleteMany({ uid: user._id });
    const otp = await OTP.create({ code, uid: user._id });

    const mailOptions = {
      from: process.env.MAILER_EMAIL,
      to: email,
      subject: 'Reset Password OTP',
      html: `<p>Hello ${user.username.toUpperCase()} here's your <strong>${code}</strong> OTP to reset your password. </p>`,
    };

    await mailer(mailOptions);

    req.session.secret = secret;
    req.session.uid = otp.uid;
    req.session.save();

    res.json({
      ok: true,
      message: 'We have sent an OTP to your email. Please check your inbox.',
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

const handleResetPassword = async function (req, res) {
  try {
    const { secret, uid } = req.session;
    const { password, code } = req.body;

    if (!password) {
      return res.status(400).json({ ok: false, message: 'Please enter a password.' });
    }

    if (!validateCode(secret, code)) {
      return res.status(400).json({ ok: false, message: 'Please enter a valid OTP.' });
    }

    const otp = await OTP.findOne({ code, uid });
    await OTP.deleteMany({ uid });

    if (!otp) {
      return res.status(400).json({ ok: false, message: 'OTP has been already used.' });
    }

    const user = await User.findOne({ _id: otp.uid });

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (passwordMatched) {
      return res.status(400).json({ ok: false, message: 'Please enter a new password.' });
    }
    user.tokens = [];
    user.password = password;
    await user.save();

    res.status(200).json({ ok: true, message: 'Password successfully reset.' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

module.exports = {
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
};
