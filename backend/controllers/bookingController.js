// backend/controllers/bookingController.js
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const BookedSeat = require('../models/BookedSeat');
const pool = require('../config/db');


exports.createBooking = async (req, res) => {
  const { user_id, screening_id, seats_booked, amount } = req.body;
  console.log('Creating booking:', { user_id, screening_id, seats_booked, amount });
  try {
    if (!user_id || !screening_id || !seats_booked || !amount) {
      throw new Error('Missing required fields');
    }
    // Check if seats are already booked
    const bookedSeats = await BookedSeat.findByScreening(screening_id);
    const requestedSeats = seats_booked.split(',');
    const alreadyBooked = requestedSeats.filter(seat => bookedSeats.includes(seat.trim()));
    if (alreadyBooked.length > 0) {
      throw new Error(`Seats already booked: ${alreadyBooked.join(', ')}`);
    }

    const bookingId = await Booking.create({ user_id, screening_id, seats_booked });
    const transaction_id = `TXN_${Date.now()}`;
    const paymentId = await Payment.create({ booking_id: bookingId, amount, transaction_id });
    console.log('Booking created:', { bookingId, paymentId });
    res.json({ bookingId, paymentId });
  } catch (error) {
    console.error('Create booking error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.confirmBooking = async (req, res) => {
  const { booking_id, payment_id } = req.body;
  console.log('Confirming booking:', { booking_id, payment_id });
  try {
    await Booking.updateStatus(booking_id, 'confirmed');
    await Payment.updateStatus(payment_id, 'completed');
    res.json({ message: 'Booking confirmed' });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getBookedSeats = async (req, res) => {
  const { screening_id } = req.params;
  try {
    const bookedSeats = await BookedSeat.findByScreening(screening_id);
    console.log('Sending booked seats for screening', screening_id, ':', bookedSeats);
    res.json(bookedSeats);
  } catch (error) {
    console.error('Error fetching booked seats:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  const userId = req.user.userId; // From JWT
  console.log(`Fetching bookings for user_id: ${userId}`);
  try {
    const [bookings] = await pool.query(
      `
      SELECT 
        b.booking_id,
        b.seats_booked,
        b.amount,
        m.title AS movie_title,
        t.name AS theatre_name,
        t.location AS theatre_location,
        s.show_time,
        GROUP_CONCAT(bs.seat_number) AS seat_numbers
      FROM Booking b
      JOIN Screening s ON b.screening_id = s.screening_id
      JOIN Movie m ON s.movie_id = m.movie_id
      JOIN Theatre t ON s.theatre_id = t.theatre_id
      LEFT JOIN BookedSeat bs ON b.booking_id = bs.booking_id
      WHERE b.user_id = ?
      GROUP BY b.booking_id
      ORDER BY s.show_time DESC
      `,
      [userId]
    );
    console.log(`Found ${bookings.length} bookings for user_id: ${userId}`);
    res.json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error.message, error.stack);
    res.status(500).json({ error: `Failed to fetch bookings: ${error.message}` });
  }
};