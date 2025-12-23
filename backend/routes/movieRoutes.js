const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Screening = require('../models/Screening');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const movies = await Movie.findAll();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies', details: err.message });
  }
});

router.get('/admin/movies', authMiddleware, async (req, res) => {
  try {
    const movies = await Movie.findAll();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies for admin', details: err.message });
  }
});

router.post('/admin/movies', authMiddleware, async (req, res) => {
  const { title, genre, duration, image_url, screenings } = req.body;
  try {
    const movieId = await Movie.create({ title, genre, duration, image_url });
    if (screenings && screenings.length > 0) {
      await Screening.createBulk(movieId, screenings);
    }
    res.status(201).json({ id: movieId });
  } catch (err) {
    console.error('Movie creation error:', err.message);
    res.status(500).json({ error: 'Failed to create movie', details: err.message });
  }
});

router.delete('/admin/movies/:id', authMiddleware, async (req, res) => {
  try {
    await Movie.delete(req.params.id);
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete movie', details: err.message });
  }
});

module.exports = router;