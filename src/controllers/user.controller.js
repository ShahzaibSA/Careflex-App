'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');

const User = require('../models/user.model');
const OTP = require('../models/otp.model');
const mailer = require('../utils/mailer');
const { generateOTP, validateCode } = require('../utils/otp');
const { BadRequestException, NotFoundException } = require('../exceptions');
const {
  userSignupSchema,
  loginSchema,
  updateUserSchema,
  updatePasswordSchema,
  forgotPasswordSchema,
  deleteUserPasswordSchema,
  resetPasswordSchema,
} = require('../validations/user.validation');

//!Signup
const handleCreateUser = async function (req, res, next) {
  try {
    const body = await userSignupSchema.validateAsync(req.body);

    const userExist = await User.findOne({ email: body.email });
    if (userExist) {
      return next({ status: 409, message: 'Email already exist' });
    }

    const user = new User(body);
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
      message: `A verification OTP is sent to ${body.email}. Please verify your OTP.`,
    });
  } catch (error) {
    return next(error);
    // res.status(500).json({ ok: false, error: error?.message || error });
  }
};

//! Verify OTP
const handleVerifyEmail = async function (req, res, next) {
  const userEnteredCode = req.body.code;
  if (String(userEnteredCode).length < 6) {
    return next(new BadRequestException('Please enter valid OTP!'));
  }
  try {
    const otp = await OTP.findOneAndDelete({ code: userEnteredCode });
    if (!otp || !validateCode(otp.secret, userEnteredCode)) {
      return next(new BadRequestException('Please enter valid OTP!'));
    }

    const user = await User.findOne({ _id: otp.uid });
    if (!user) {
      return next(new NotFoundException('Please sign up again.'));
    }
    user.isEmailVerified = true;
    await user.save();

    const token = await user.generateToken();

    res.status(201).json({
      ok: true,
      token,
      data: { user },
      message: 'Email successfully verified.',
    });
  } catch (error) {
    next(error);
  }
};

//!Login
const handleLoginUser = async function (req, res, next) {
  try {
    const body = await loginSchema.validateAsync(req.body);
    const user = await User.findOne({ email: body.email });
    if (!user) {
      return next(new BadRequestException('No Account Found. Please Sign Up!'));
    }
    if (!user.isEmailVerified) {
      return next(new BadRequestException(`An OTP is sent to ${body.email}. Please verify it to continue!`));
    }
    const passwordMatched = await bcrypt.compare(body.password, user.password);
    if (!passwordMatched) {
      return next(new BadRequestException('Invalid Email or Password'));
    }

    const token = await user.generateToken();
    res.status(200).json({ ok: true, token, data: { user } });
  } catch (error) {
    next(error);
  }
};

//! Get User
const handleGetUser = function (req, res, next) {
  try {
    res.status(200).json({
      ok: true,
      data: { user: req.user },
      token: req.token,
    });
  } catch (error) {
    next(error);
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
const handleUpdateUser = async function (req, res, next) {
  // const { body } = req;
  const user = req.user;
  try {
    const body = await updateUserSchema.validateAsync(req.body);
    const updates = Object.keys(body);
    const allowedUpdates = ['username'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return next(new BadRequestException('Invalid updates!'));
    }

    updates.forEach((update) => (req.user[update] = body[update]));
    await user.save();

    res.status(200).json({ ok: true, data: { user }, message: 'Profile successfully updated.' });
  } catch (error) {
    next(error);
  }
};

//! Update Password
const handleUpdatePassword = async function (req, res, next) {
  try {
    const { currentPassword, newPassword, confirmPassword } = await updatePasswordSchema.validateAsync(req.body);

    const user = req.user;

    const passwordMatched = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatched) {
      return next(new BadRequestException('Your current password was entered incorrectly.'));
    }

    if (newPassword !== confirmPassword) {
      return next(new BadRequestException('New password must be different from current password.'));
    }

    if (newPassword === currentPassword) {
      return next(new BadRequestException('New password must be different from current password.'));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ ok: true, data: { user }, message: 'Password successfully updated.' });
  } catch (error) {
    next(error);
  }
};

//! Logout User
const handleLogoutUser = async function (req, res, next) {
  try {
    const { user } = req;
    user.tokens = user.tokens.filter((tokens) => tokens.token !== req.token);
    await user.save();
    res.status(200).json({ ok: true, message: 'User successfully Logged out.' });
  } catch (error) {
    next(error);
  }
};

//! Logout other devices
const handleLogoutAll = async function (req, res, next) {
  try {
    const { user } = req;
    user.tokens = user.tokens.filter((tokens) => tokens.token === req.token);
    await user.save();

    res.status(200).json({
      ok: true,
      message: 'All other devices successfully Logged out.',
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteUser = async function (req, res, next) {
  try {
    const user = req.user;
    const { password } = await deleteUserPasswordSchema.validateAsync(req.body);

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      return next(new BadRequestException('Please enter your password correctly.'));
    }
    await User.deleteOne({ email: user.email });
    res.status(200).json({ ok: true, message: 'Account successfully deleted.' });
  } catch (error) {
    next(error);
  }
};

const handleForgotPassword = async function (req, res, next) {
  try {
    const { email } = await forgotPasswordSchema.validateAsync(req.body);
    const user = await User.findOne({ email });
    if (!user) {
      return next(new NotFoundException('No user found with this email.'));
    }

    const { code, secret } = generateOTP();

    await OTP.deleteMany({ uid: user._id });
    const otp = await OTP.create({ code, secret, uid: user._id });

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
      message: `We have sent an OTP to ${email}. Please check your inbox.`,
    });
  } catch (error) {
    next(error);
  }
};

const handleResetPassword = async function (req, res, next) {
  try {
    const { secret, uid } = req.session;
    const code = req.body.code;
    if (String(code).length < 6) {
      return next(new BadRequestException('Please enter valid OTP!'));
    }

    const { password } = await resetPasswordSchema.validateAsync(req.body);

    if (!password) {
      return next(new BadRequestException('Please enter a password.'));
    }

    if (!validateCode(secret, code)) {
      return next(new BadRequestException('Please enter a valid OTP.'));
    }

    const otp = await OTP.findOne({ code, uid });

    if (!otp) {
      return next(new BadRequestException('OTP has been already used.'));
    }

    const user = await User.findOne({ _id: otp.uid });

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (passwordMatched) {
      return next(new BadRequestException('Please enter a new password.'));
    }
    user.tokens = [];
    user.password = password;
    await user.save();

    await OTP.deleteMany({ uid });

    res.status(200).json({ ok: true, message: 'Password successfully reset.' });
  } catch (error) {
    next(error);
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
