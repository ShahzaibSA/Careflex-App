'use strict';

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
      return res.status(404).json({ error: 'Password does not match!' });
    }

    // const user = new User({ ...body, role: 'home' });
    const user = new User(body);
    await user.save();

    const token = await user.generateAuthToken();

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error });
  }
};

//!Login
const handleLoginUser = async function (req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No Account Found. Please Sign Up!' });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      return res.status(400).json({ error: 'Invalid Email or Password' });
    }

    const token = await user.generateAuthToken();
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error });
  }
};

//! Get User
const handleGetUser = function (req, res) {
  try {
    res.status(200).json({
      user: req.user,
      token: req.token
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

//! Update User
const handleUpdateUser = async function (req, res) {
  try {
    const user = req.user;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates!' });

    updates.forEach((update) => (req.user[update] = req.body[update]));
    await user.save();

    res.status(200).json({ user, message: 'Profile successfully updated.' });
  } catch (error) {
    res.status(500).json({ error });
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
        .json({ message: 'Your current password was entered incorrectly.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password does not match.' });
    }

    if (newPassword === currentPassword) {
      return res
        .status(400)
        .json({ message: 'New password must be different from current password.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ user, message: 'Password successfully updated.' });
  } catch (error) {
    res.status(500).json({ error });
  }
};

//! Logout User
const handleLogoutUser = async function (req, res) {
  try {
    const { user } = req;
    user.tokens = user.tokens.filter((tokens) => tokens.token !== req.token);
    await user.save();
    res.status(200).json({ message: 'User successfully Logged out' });
  } catch (error) {
    res.status(500).json({ error });
  }
};

//! Logout other devices
const handleLogoutAll = async function (req, res) {
  try {
    const { user } = req;
    user.tokens = user.tokens.filter((tokens) => tokens.token === req.token);
    await user.save();

    res.status(200).json({ message: 'All other devices successfully Logged out' });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const handleDeleteUser = async function (req, res) {
  try {
    const { password } = req.body;
    const user = req.user;

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      return res.status(400).json({ message: 'Please enter your password correctly.' });
    }
    await User.deleteOne({ email: user.email });
    res.status(200).json({ message: 'Account successfully deleted.' });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const handleForgotPassword = async function (req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user found with this email.' });

    const token = jwt.sign({ uid: user._id }, process.env.TOKEN_SECRET, { expiresIn: '10m' });
    if (!token) return res.sendStatus(500);

    await mailer(user, token);

    user.tokens = user.tokens.concat({ token: token });
    await user.save();

    res
      .status(200)
      .json({ message: 'We have sent an email to you. Please check your inbox.' });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const handleResetPassword = async function (req, res) {
  try {
    let forgotPasswordToken = req.query.token;
    const { password } = req.body;

    const decoded = jwt.verify(forgotPasswordToken, process.env.TOKEN_SECRET);
    if (!decoded) return res.status(404).json({ message: 'Token has been expired.' });

    const user = await User.findOne({ _id: decoded.uid, 'tokens.token': forgotPasswordToken });
    if (!user) return res.sendStatus(400);

    user.tokens = user.tokens.filter((tokens) => tokens.token !== forgotPasswordToken);
    user.password = password || 'Test@12345';
    await user.save();
    res.status(200).json({ message: 'Password successfully reset.' });
  } catch (error) {
    res.status(500).json({ error });
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
  handleResetPassword
};
