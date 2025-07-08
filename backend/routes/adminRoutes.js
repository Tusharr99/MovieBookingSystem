const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const jwt = require('jsonwebtoken');

const authAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/movies', authAdmin, adminController.addMovie);
router.delete('/movies/:movie_id', authAdmin, adminController.deleteMovie);
router.get('/theatres', authAdmin, adminController.getTheatres);
router.post('/theatres', authAdmin, adminController.addTheatre);
router.delete('/theatres/:theatre_id', authAdmin, adminController.deleteTheatre);

module.exports = router;