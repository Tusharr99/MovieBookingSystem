// backend/controllers/theatreController.js
const Theatre = require('../models/Theatre');

exports.getTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.findAll();
    console.log('Sending theatres:', theatres);
    res.json(theatres);
  } catch (error) {
    console.error('Error fetching theatres:', error);
    res.status(500).json({ error: error.message });
  }
};