'use strict';
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    code: { type: Number },
    uid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

const OTP = mongoose.model('otp', otpSchema);

module.exports = OTP;
