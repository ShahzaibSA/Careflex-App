'use strict';

const speakeasy = require('speakeasy');
const OTP = require('../models/otpModel');

const generateOTP = function () {
  try {
    const secret = speakeasy.generateSecret({ length: 20 });
    // Generate a TOTP code using the secret key
    let code = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32'
    });

    if (code.toString().length !== 6) {
      code = generateOTP(user._id);
    }

    return { code, secret: secret.base32 };
  } catch (error) {
    throw new Error(error);
  }
};

const validateCode = function (secret, code) {
  const isCodeValidate = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: code,
    window: 6
  });
  return isCodeValidate;
};

module.exports = { generateOTP, validateCode };
