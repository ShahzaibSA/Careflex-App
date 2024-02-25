'use strict';
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      required: [true, 'Please specify user role'],
      enum: ['ADMIN', 'HOME', 'GIVER']
    },
    username: {
      type: String,
      trim: true,
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
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('Password cannot contain "password"');
        }
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            'Your password must contain 8 characters, 1 Uppsercase, 1 Lowercase, 1 Number, 1 Symbol'
          );
        }
      }
    },
    tokens: [{ token: { type: String, required: true } }]
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
    expiresIn: time || '7d'
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
