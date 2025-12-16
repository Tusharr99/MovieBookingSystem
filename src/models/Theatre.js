const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    screens: { type: Number, default: 1 },
    seatingLayout: {
      type: Object,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Theatre', theatreSchema);

