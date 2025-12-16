const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    screening: { type: mongoose.Schema.Types.ObjectId, ref: 'Screening', required: true },
    seats: [{ type: String, required: true }],
    total: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    paymentRef: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);

