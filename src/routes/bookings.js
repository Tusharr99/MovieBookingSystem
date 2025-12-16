const express = require('express');
const { listBookings, createBooking } = require('../controllers/bookingController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, listBookings);
router.post('/', auth, createBooking);

module.exports = router;

