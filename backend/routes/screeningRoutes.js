const express = require('express');
const router = express.Router();
const Screening = require('../models/Screening');

router.get('/', async (req, res) => {
  try {
    const screenings = await Screening.findAll();
    console.log('Sending screenings:', screenings);
    res.json(screenings);
  } catch (err) {
    console.error('Error fetching screenings:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { movie_id, theatre_id, show_time } = req.body;
    console.log('Creating screening with:', { movie_id, theatre_id, show_time });
    const screeningId = await Screening.create({ movie_id, theatre_id, show_time });
    res.status(201).json({ id: screeningId });
  } catch (err) {
    console.error('Error creating screening:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;