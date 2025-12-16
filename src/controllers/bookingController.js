const Booking = require('../models/Booking');
const Screening = require('../models/Screening');

const listBookings = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
    const bookings = await Booking.find(filter)
      .populate({ path: 'screening', populate: [{ path: 'movie' }, { path: 'theatre' }] })
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const { screeningId, seats } = req.body;
    const screening = await Screening.findById(screeningId);
    if (!screening) return res.status(404).json({ message: 'Screening not found' });

    // Prevent double booking seats
    const alreadyTaken = seats.some((seat) => screening.seatsBooked.includes(seat));
    if (alreadyTaken) return res.status(400).json({ message: 'One or more seats already booked' });

    if (screening.seatsAvailable < seats.length) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    screening.seatsBooked.push(...seats);
    screening.seatsAvailable -= seats.length;
    await screening.save();

    const total = seats.length * screening.price;
    const booking = await Booking.create({
      user: req.user.id,
      screening: screening._id,
      seats,
      total,
      paymentRef: `PAY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    });

    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
};

module.exports = { listBookings, createBooking };

