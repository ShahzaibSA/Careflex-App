'use strict';

require('dotenv').config();

const Shift = require('../models/shift.model');
const shiftValidaiton = require('../validations/shift.validation');

const handleCreateShift = async function (req, res) {
  try {
    const user = req.user;
    const body = await shiftValidaiton.validateAsync(req.body);
    const shift = await Shift.create({ ...body, uid: user._id });
    delete shift._id;
    delete shift.__v;
    res.status(200).json({ ok: true, data: { shift }, message: 'Shift successfully created.' });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ ok: false, error: error.details[0].message });
    }
    res.status(500).json({ ok: false, error });
  }
};

module.exports = {
  handleCreateShift,
};
