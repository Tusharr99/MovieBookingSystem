const mongoose = require('mongoose');

const screeningSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
    screen: { type: Number, default: 1 },
    startTime: { type: Date, required: true },
    price: { type: Number, required: true },
    seatsAvailable: { type: Number, required: true },
    seatsBooked: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Screening', screeningSchema);

