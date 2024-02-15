'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const mailer = require('../utils/mailer');

//!Signup
const handleCreateUser = async function (req, res) {
  const { body } = req;
  try {
    // await User.deleteMany();
    if (body.password !== body.confirmPassword) {
      return res.status(404).json({ ok: false, message: 'Password does not match!' });
    }

    // const user = new User({ ...body, role: 'home' });
    const user = new User(body);
    await user.save();

    const token = await user.generateToken();

    const mailOptions = {
      from: process.env.MAILER_EMAIL,
      to: user.email,
      subject: 'Email Verification',
      html: `<p>Hello ${user.username} <a href='${process.env.BASE_URL}/v1/users/verification?token=${token}'>Click Here</a> to verify your email. </p>`
    };

    await mailer(mailOptions);

    res.status(201).json({
      ok: true,
      message: 'A verification email is sent to your email address. Please verify your email.'
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

//!Login
const handleLoginUser = async function (req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ ok: false, message: 'No Account Found. Please Sign Up!' });
    }
<<<<<<< HEAD
    if (!user.isEmailVerified)
      return res.status(400).send({
        ok: false,
        message:
          'A verification email is sent to your email address. Please verify it to continue!'
      });
=======
    // if (!user.isEmailVerified)
    //   return res.status(400).send({
    //     ok: false,
    //     message:
    //       'A verification email is sent to your email address. Please verify it to continue!'
    //   });
>>>>>>> c1e3f41 (Add OK field in response and changed node mailer settings and minor change.)
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
      token: req.token
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

//! Update User
const handleUpdateUser = async function (req, res) {
  try {
    const user = req.user;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation)
      return res.status(400).send({ ok: false, message: 'Invalid updates!' });

    updates.forEach((update) => (req.user[update] = req.body[update]));
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
      return res
        .status(400)
        .json({ ok: false, message: 'Your current password was entered incorrectly.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ ok: false, message: 'New password does not match.' });
    }

    if (newPassword === currentPassword) {
      return res
        .status(400)
        .json({ ok: false, message: 'New password must be different from current password.' });
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
    res.status(200).json({ ok: true, message: 'User successfully Logged out' });
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

    res.status(200).json({ ok: true, message: 'All other devices successfully Logged out' });
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
      return res
        .status(400)
        .json({ ok: false, message: 'Please enter your password correctly.' });
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
    if (!user)
      return res.status(404).json({ ok: false, message: 'No user found with this email.' });

    const token = await user.generateToken('10m');

    const mailOptions = {
      from: process.env.MAILER_EMAIL,
      to: user.email,
      subject: 'Reset Your Password',
      html: `<p>Hello ${user.username} <a href='${process.env.BASE_URL}/v1/users/reset-password?token=${token}'>Click Here</a> to reset your password. </p>`
    };

    await mailer(mailOptions);

    res.json({ ok: true, message: 'We have sent an email to you. Please check your inbox.' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
  }
};

const handleResetPassword = async function (req, res) {
  try {
    const forgotPasswordToken = req.query.token;
    const { password } = req.body;
    if (!password || !forgotPasswordToken) {
      return res
        .status(400)
        .json({ ok: false, message: 'Please provide token and password.' });
    }

    const decoded = jwt.verify(forgotPasswordToken, process.env.TOKEN_SECRET);
    if (!decoded)
      return res.status(404).json({ ok: false, message: 'Token has been expired.' });

    const user = await User.findOne({ _id: decoded.uid, 'tokens.token': forgotPasswordToken });
    if (!user)
      return res.status(400).json({ ok: false, message: 'Token has been already used.' });

    user.tokens = user.tokens.filter((tokens) => tokens.token !== forgotPasswordToken);
    user.password = password;
    await user.save();
    res.status(200).json({ ok: true, message: 'Password successfully reset.' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
<<<<<<< HEAD
  }
};

//! Email Verification
const handleUserEmailVerification = async function (req, res) {
  try {
    const { token } = req.query;

    if (!token) return res.status(400).json({ ok: false, message: 'Please provide token.' });

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    if (!decoded) {
      return res.status(404).json({ ok: false, message: 'Token has been expired.' });
    }

    const user = await User.findOne({
      _id: decoded.uid,
      'tokens.token': token
    });

    if (!user) return res.status(400).json({ ok: false });

    user.tokens = user.tokens.filter((tokens) => tokens.token !== token);
    user.isEmailVerified = true;
    await user.save();
    res.status(200).json({ ok: true, message: 'Email successfully verified.' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || error });
=======
>>>>>>> c1e3f41 (Add OK field in response and changed node mailer settings and minor change.)
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
  handleUserEmailVerification
};
