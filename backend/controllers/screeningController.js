// backend/controllers/screeningController.js
const Screening = require('../models/Screening');

exports.getScreenings = async (req, res) => {
  try {
    const screenings = await Screening.findAll();
    console.log('Sending screenings:', screenings);
    res.json(screenings);
  } catch (error) {
    console.error('Error fetching screenings:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getScreeningById = async (req, res) => {
  const { id } = req.params;
  try {
    const screening = await Screening.findById(id);
    if (!screening) {
      return res.status(404).json({ error: 'Screening not found' });
    }
    console.log('Sending screening:', screening);
    res.json(screening);
  } catch (error) {
    console.error('Error fetching screening:', error);
    res.status(500).json({ error: error.message });
  }
};