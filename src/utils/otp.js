'use strict';

const speakeasy = require('speakeasy');

const generateOTP = function () {
  try {
    let code, secret;
    do {
      secret = speakeasy.generateSecret({ length: 20 });
      code = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32'
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
    window: 6
  });
  return isCodeValidate;
};

module.exports = { generateOTP, validateCode };
