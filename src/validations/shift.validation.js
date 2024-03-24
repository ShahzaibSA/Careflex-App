const Joi = require('joi');

const shiftSchema = Joi.object({
  where: Joi.string().required().messages({ 'string.empty': 'Where is a required field' }),
  who: Joi.string().required().messages({ 'string.empty': 'Who is a required field' }),
  when: Joi.string().required().messages({ 'string.empty': 'When is a required field' }),
  skills: Joi.string().required().messages({ 'string.empty': 'Skills is a required field' }),
  shift: Joi.string().required().messages({ 'string.empty': 'Shift is a required field' }),
  contactNo: Joi.string().required().messages({ 'string.empty': 'Contact No. is a required field' }),
  unitName: Joi.string().required().messages({ 'string.empty': 'Unit Name is a required field' }),
  postCode: Joi.string().required().messages({ 'string.empty': 'Post Code is a required field' }),
  preference: Joi.string()
    .required()
    .valid('Regular', 'Instant', 'As soon as possible')
    .messages({ 'string.empty': 'preference is a required field' }),
  shiftListing: Joi.string()
    .valid('Default', 'Marketplace', 'Permanent')
    .required()
    .messages({ 'string.empty': 'Shift Listing is a required field' }),
});

const applyShiftSchema = Joi.object({
  shiftId: Joi.string().min(24).max(24),
  shiftCreatedBy: Joi.string().min(24).max(24),
});

const shiftCompletionSchema = Joi.object({
  shiftId: Joi.string().required().min(24).max(24),
  shiftCreatedBy: Joi.string().required().min(24).max(24),
});

const userIdSchema = Joi.object({
  shiftCreatedBy: Joi.string().min(24).max(24),
});

const statusChangeSchema = Joi.object({
  applicantId: Joi.string().required().min(24).max(24),
  shiftId: Joi.string().required().min(24).max(24),
  status: Joi.string()
    .uppercase()
    .required()
    .valid('REJECTED', 'APPROVED')
    .messages({ 'string.empty': 'Status is required field with valid status' }),
});

const shiftApplicantSchema = Joi.object({
  shiftId: Joi.string().required().min(24).max(24),
  status: Joi.string().uppercase().valid('PENDING', 'CANCELLED', 'REJECTED', 'APPROVED'),
});

module.exports = {
  shiftSchema,
  applyShiftSchema,
  shiftCompletionSchema,
  userIdSchema,
  statusChangeSchema,
  shiftApplicantSchema,
};
