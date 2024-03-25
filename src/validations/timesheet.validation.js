const Joi = require('joi');

const shiftIdSchema = Joi.object({
  shiftId: Joi.string().required().min(24).max(24),
});

const timesheetStatus = Joi.object({
  status: Joi.string().uppercase().valid('PENDING', 'APPROVED', 'REJECTED'),
});

module.exports = { shiftIdSchema, timesheetStatus };
