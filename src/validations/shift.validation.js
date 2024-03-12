const Joi = require('joi');

const shiftValidaiton = Joi.object({
  where: Joi.string().required().messages({ 'string.empty': 'Where is a required field' }),
  who: Joi.string().required().messages({ 'string.empty': 'Who is a required field' }),
  when: Joi.string().required().messages({ 'string.empty': 'When is a required field' }),
  skills: Joi.string().required().messages({ 'string.empty': 'Skills is a required field' }),
  shift: Joi.string().required().messages({ 'string.empty': 'Shift is a required field' }),
  contactNo: Joi.string().required().messages({ 'string.empty': 'Contact No. is a required field' }),
  unitName: Joi.string().required().messages({ 'string.empty': 'Unit Name is a required field' }),
  postCode: Joi.string().required().messages({ 'string.empty': 'Post Code is a required field' }),
  preference: Joi.string().required().messages({ 'string.empty': 'preference is a required field' }),
  shiftListing: Joi.string().required().messages({ 'string.empty': 'Shift Listing is a required field' }),
});

module.exports = shiftValidaiton;
