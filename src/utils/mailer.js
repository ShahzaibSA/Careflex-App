require('dotenv').config();
const nodemailer = require('nodemailer');

const mailer = async function (user, forgotPasswordToken) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      },
      auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_EMAIL_PASS
      }
    });
    const mailOptions = {
      from: process.env.MAILER_EMAIL,
      to: user.email,
      subject: 'Reset Your Password',
      html: `<p>Hello ${user.username} <a href='${process.env.BASE_URL}/v1/users/reset-password?token=${forgotPasswordToken}'>Click Here</a> to reset your password. </p>`
    };
    transporter.sendMail(mailOptions, function (error, success) {
      if (error) {
        console.log('Error in nodemailer ', error);
        throw new Error('Cannot sent email this time. Please try again later.');
      } else {
        console.log('Mail Send Successfully ', success.response);
      }
    });
  } catch (error) {
    res.status(500).send({ error });
  }
};

module.exports = mailer;
