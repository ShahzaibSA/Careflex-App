/* eslint-disable no-useless-escape */
'use strict';

const Joi = require('joi');

const userSignupSchema = Joi.object({
  role: Joi.string().uppercase().required(),
  email: Joi.string().email().trim().lowercase().required(),
  username: Joi.string().min(5).max(20).trim().uppercase().required(),
  password: Joi.string()
    .regex(/^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)
    .required()
    .trim()
    .messages({
      'string.pattern.base':
        'Password must contain at least 8 characters and include at least one of the following: a-z, A-Z, 0-9, !@#$%^&*',
    }),
  confirmPassword: Joi.ref('password'),
}).options({ abortEarly: false });

const deleteUserPasswordSchema = Joi.object({
  password: Joi.string()
    .trim()
    .required()
    .regex(/^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)
    .messages({
      'string.pattern.base':
        'Password must contain at least 8 characters and include at least one of the following: a-z, A-Z, 0-9, !@#$%^&*',
    }),
});

const updateUserSchema = Joi.object({
  username: Joi.string().min(5).trim().uppercase().required(),
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .trim()
    .required()
    .regex(/^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)
    .messages({
      'string.pattern.base':
        'Password must contain at least 8 characters and include at least one of the following: a-z, A-Z, 0-9, !@#$%^&*',
    }),
  confirmPassword: Joi.ref('newPassword'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
});

const resetPasswordSchema = Joi.object({
  code: Joi.number(),
  password: Joi.string()
    .trim()
    .required()
    .regex(/^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)
    .messages({
      'string.pattern.base':
        'Password must contain at least 8 characters and include at least one of the following: a-z, A-Z, 0-9, !@#$%^&*',
    }),
  confirmPassword: Joi.ref('password'),
});

module.exports = {
  userSignupSchema,
  updatePasswordSchema,
  updateUserSchema,
  loginSchema,
  deleteUserPasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
