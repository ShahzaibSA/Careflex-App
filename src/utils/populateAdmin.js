const User = require('../models/userModel');

module.exports = async () => {
  try {
    const admin = await User.findOne({ email: 'careflex.app@gmail.com' });
    if (!admin) {
      User.create({
        username: 'Careflex Admin',
        email: 'careflex.app@gmail.com',
        password: 'Admin@123',
        isEmailVerified: true,
        isAdmin: true,
        role: 'ADMIN'
      });
    }
  } catch (error) {
    console.log(error);
  }
};
