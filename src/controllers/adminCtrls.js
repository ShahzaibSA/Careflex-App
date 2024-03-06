'use strict';

// require('dotenv').config();
// const bcrypt = require('bcrypt');

const User = require('../models/userModel');

const handleGetAllUser = async function (req, res) {
  // const qRole = Object.values(req.query);

  // const allowedRoles = ['HOME', 'GIVER'];
  // const isValidRole = qRole.every((update) => allowedRoles.includes(update));

  // if (!isValidRole) {
  //   return res
  //     .status(400)
  //     .json({ ok: false, message: 'Please provide right role e.g: HOME or GIVER' });
  // }

  const { role } = req.query;

  try {
    const users = await User.find().find({}).sort({ createdAt: 'desc' }).exec();
    res.status(200).json({ ok: true, users });
  } catch (error) {
    res.status(500).json({ ok: false, error });
  }
};

module.exports = { handleGetAllUser };
