const Screening = require('../models/Screening');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');

const listScreenings = async (req, res, next) => {
  try {
    const screenings = await Screening.find()
      .populate('movie', 'title posterUrl durationMins')
      .populate('theatre', 'name location')
      .sort({ startTime: 1 });
    res.json({ screenings });
  } catch (err) {
    next(err);
  }
};

const createScreening = async (req, res, next) => {
  try {
    const { movie, theatre, startTime, price, seatsAvailable, screen } = req.body;
    const [movieExists, theatreExists] = await Promise.all([
      Movie.findById(movie),
      Theatre.findById(theatre)
    ]);
    if (!movieExists || !theatreExists) {
      return res.status(400).json({ message: 'Movie or theatre not found' });
    }
    const screening = await Screening.create({ movie, theatre, startTime, price, seatsAvailable, screen });
    res.status(201).json({ screening });
  } catch (err) {
    next(err);
  }
};

const updateScreening = async (req, res, next) => {
  try {
    const screening = await Screening.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!screening) return res.status(404).json({ message: 'Screening not found' });
    res.json({ screening });
  } catch (err) {
    next(err);
  }
};

const deleteScreening = async (req, res, next) => {
  try {
    const screening = await Screening.findByIdAndDelete(req.params.id);
    if (!screening) return res.status(404).json({ message: 'Screening not found' });
    res.json({ message: 'Screening removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listScreenings, createScreening, updateScreening, deleteScreening };

