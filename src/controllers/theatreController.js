const Theatre = require('../models/Theatre');

const listTheatres = async (req, res, next) => {
  try {
    const theatres = await Theatre.find().sort({ createdAt: -1 });
    res.json({ theatres });
  } catch (err) {
    next(err);
  }
};

const createTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json({ theatre });
  } catch (err) {
    next(err);
  }
};

const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!theatre) return res.status(404).json({ message: 'Theatre not found' });
    res.json({ theatre });
  } catch (err) {
    next(err);
  }
};

const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);
    if (!theatre) return res.status(404).json({ message: 'Theatre not found' });
    res.json({ message: 'Theatre removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listTheatres, createTheatre, updateTheatre, deleteTheatre };

