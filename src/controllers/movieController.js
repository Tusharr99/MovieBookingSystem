const Movie = require('../models/Movie');

const listMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    if (req.accepts('html')) {
      return res.render('pages/movies', { title: 'Movies', movies });
    }
    res.json({ movies });
  } catch (err) {
    next(err);
  }
};

const getMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ movie });
  } catch (err) {
    next(err);
  }
};

const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ movie });
  } catch (err) {
    next(err);
  }
};

const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ movie });
  } catch (err) {
    next(err);
  }
};

const deleteMovie = async (req, res, next) => {
  try {
    const deleted = await Movie.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Movie removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listMovies, getMovie, createMovie, updateMovie, deleteMovie };

