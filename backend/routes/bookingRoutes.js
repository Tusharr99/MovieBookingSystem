// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const jwt = require('jsonwebtoken');

const authUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/user/bookings', authUser, bookingController.getUserBookings);

router.post('/', bookingController.createBooking);
router.post('/confirm', bookingController.confirmBooking);
router.get('/seats/:screening_id', bookingController.getBookedSeats);

module.exports = router;