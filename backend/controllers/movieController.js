// backend/controllers/movieController.js
const Movie = require('../models/Movie');

exports.getMovies = async (req, res) => {
  try {
    const movies = await Movie.findAll();
    console.log('Sending movies:', movies);
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: error.message });
  }
};