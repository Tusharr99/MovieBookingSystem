const Review = require('../models/Review');
const Movie = require('../models/Movie');

const listReviews = async (req, res, next) => {
  try {
    const { movie } = req.query;
    if (!movie) return res.status(400).json({ message: 'movie is required' });
    const reviews = await Review.find({ movie })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    const avg =
      reviews.length === 0
        ? 0
        : Math.round((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length) * 10) / 10;
    res.json({ reviews, avgRating: avg, count: reviews.length });
  } catch (err) {
    next(err);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { movie, rating, comment } = req.body;
    if (!movie || !rating) return res.status(400).json({ message: 'movie and rating are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'rating must be 1-5' });

    const movieExists = await Movie.findById(movie);
    if (!movieExists) return res.status(404).json({ message: 'Movie not found' });

    // Optional: one review per user per movie (upsert)
    const existing = await Review.findOne({ movie, user: req.user.id });
    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      await existing.save();
      return res.status(200).json({ review: existing, updated: true });
    }

    const review = await Review.create({ movie, user: req.user.id, rating, comment });
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

module.exports = { listReviews, createReview };

