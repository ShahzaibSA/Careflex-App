'use strict';

const speakeasy = require('speakeasy');
const OTP = require('../models/otpModel');

const generateOTP = async function (id) {
  try {
    const secret = speakeasy.generateSecret({ length: 20 });
    // Generate a TOTP code using the secret key
    const code = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32'
    });

    const _otp = await OTP.create({ code: code, uid: id });

    return { code: _otp.code, uid: _otp.uid, secret: secret.base32 };
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = generateOTP;
