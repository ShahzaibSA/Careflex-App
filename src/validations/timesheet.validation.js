const Joi = require('joi');

const shiftIdSchema = Joi.object({
  shiftId: Joi.string().required().min(24).max(24),
});

module.exports = { shiftIdSchema };
