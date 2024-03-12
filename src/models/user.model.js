'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      required: [true, 'Please specify user role'],
      enum: ['ADMIN', 'HOME', 'GIVER'],
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    tokens: [{ token: { type: String, required: true } }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

userSchema.methods.generateToken = async function (time) {
  const user = this;
  const token = jwt.sign({ uid: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: time || '7d',
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.__v;
  delete userObject.tokens;
  delete userObject.password;
  delete userObject.confirmPassword;
  delete userObject.isEmailVerified;

  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
