const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    posterUrl: { type: String },
    durationMins: { type: Number },
    genres: [{ type: String }],
    rating: { type: Number, min: 0, max: 10 },
    releaseDate: { type: Date },
    status: { type: String, enum: ['coming_soon', 'now_showing'], default: 'now_showing' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);

