'use strict';
const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    where: { type: String, required: true },
    who: { type: String, required: true },
    when: { type: String, required: true },
    skills: { type: String, required: true },
    shift: { type: String, required: true },
    contactNo: { type: String, required: true },
    unitName: { type: String, required: true },
    postCode: { type: String, required: true },
    preference: { type: String, required: true, enum: ['Regular', 'Instant', 'As soon as possible'] },
    shiftListing: { type: String, required: true, enum: ['Default', 'Marketplace', 'Permanent'] },
    uid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;
