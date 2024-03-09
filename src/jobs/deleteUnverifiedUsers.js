'use strict';

const User = require('../models/user.model');
const { CronJob } = require('cron');

const job = CronJob.from({
  cronTime: '55 23 * * *',
  onTick: async function () {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    await User.deleteMany({
      createdAt: { $lt: fifteenDaysAgo },
      isEmailVerified: false,
    });
    // console.log(data);
  },
  timeZone: 'UTC',
});

module.exports = job;

// (async function () {
// await agenda.start();
// await agenda.every('day', 'Delete unverified users', {
//   scheduled: true,
//   timezone: 'UTC'
// });
/* let currentUtcTime = new Date();
  console.log(currentUtcTime.toUTCString());
  currentUtcTime.setUTCHours(10, currentUtcTime.getUTCMinutes() + 1, 0, 0);
  console.log('Current UTC time:', currentUtcTime.toISOString()); */
// })();

// (async function () {
// Find records older than 15 days
//   const randomNumber = Math.floor(Math.random() * 200);
//   const nuser = new User({
//     isEmailVerified: false,
//     role: 'GIVER',
//     username: 'shahzaib ahmed',
//     email: `shahzaibphones${randomNumber}@gmail.com`,
//     password: 'Test@123',
//     createdAt: `2024-02-1${Math.floor(Math.random() * 8)}T17:18:31.041Z`
//   });
// await nuser.save();
// })();

// const { Agenda } = require('@hokify/agenda');
// const agenda = new Agenda({
//   db: { address: process.env.MONGO_URL, collection: 'jobs' }
// });

// agenda.define('Delete unverified users', async (job) => {
//   const fifteenDaysAgo = new Date();
//   fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 9);
//   const data = await User.find({
//     createdAt: { $lt: fifteenDaysAgo },
//     isEmailVerified: false
//   });
//   console.log(data);
// });

// module.exports = agenda;

// module.exports = async function () {
//   // Find records of unverified users older than 15 days and delete it.
//   //   const randomNumber = Math.floor(Math.random() * 200);
//   // const nuser = new User({
//   //   isEmailVerified: false,
//   //   role: 'GIVER',
//   //   username: 'shahzaib ahmed',
//   //   email: `shahzaibphones${randomNumber}@gmail.com`,
//   //   password: 'Test@123'
//   // createdAt: `2024-02-1${Math.floor(Math.random() * 8)}T17:18:31.041Z`
//   // });
//   // await nuser.save();
//   const fifteenDaysAgo = new Date();
//   fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 9);
//   // const data = await User.find({ createdAt: { $lt: fifteenDaysAgo }, isEmailVerified: false });
//   // console.log(data);

//   // const deleteData = await User.deleteMany({
//   //   createdAt: { $lt: fifteenDaysAgo },
//   //   isEmailVerified: false
//   // });
//   // console.log(deleteData);
// };
