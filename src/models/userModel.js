'use strict';
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['ADMIN', 'HOME', 'GIVER']
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid!');
        }
      }
    },
    password: {
      type: String,
      trim: true,
      minLength: 7
    },
    tokens: [{ token: { type: String, required: true } }]
    // refreshTokens: [String]
    // refreshTokens: [{ refreshToken: { type: String } }]
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

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ uid: user._id }, process.env.TOKEN_SECRET, { expiresIn: '7d' });

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

  return userObject;
};

const User = mongoose.model('users', userSchema);

module.exports = User;
