/* eslint-disable no-console */
'use strict';

require('dotenv').config();
const nodemailer = require('nodemailer');

const mailer = async function (mailOptions) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      tls: {
        rejectUnauthorized: false, // Accept self-signed certificates
      },
      auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_EMAIL_PASS,
      },
    });
    transporter.sendMail(mailOptions, function (error, success) {
      if (error) {
        console.log('Error in nodemailer ', error);
        throw new Error('Cannot sent email this time. Please try again later.');
      } else {
        console.log('Mail Send Successfully ', success.response);
      }
    });
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = mailer;
