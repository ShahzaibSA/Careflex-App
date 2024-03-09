'use strict';

const speakeasy = require('speakeasy');

const generateOTP = function () {
  try {
    let code, secret;
    do {
      secret = speakeasy.generateSecret({ length: 20 });
      code = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
        time: 1453667708, // specified in seconds
      });
    } while (code.toString().length !== 6 || code.toString().startsWith('0'));

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
    window: 6,
    time: 1453667708, // specified in seconds
  });
  return isCodeValidate;
};

module.exports = { generateOTP, validateCode };
