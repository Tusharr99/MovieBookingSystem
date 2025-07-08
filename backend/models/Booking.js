const pool = require('../config/db');
const BookedSeat = require('./BookedSeat');

class Booking {
  static async create({ user_id, screening_id, seats_booked }) {
    const purchase_date = new Date();
    const [result] = await pool.query(
      'INSERT INTO booking (user_id, screening_id, seats_booked, status, purchase_date) VALUES (?, ?, ?, ?, ?)',
      [user_id, screening_id, seats_booked, 'pending', purchase_date]
    );
    const bookingId = result.insertId;

    // Insert individual seats into booked_seat
    const seats = seats_booked.split(',');
    for (const seat of seats) {
      await BookedSeat.create({
        screening_id,
        seat_number: seat.trim(),
        booking_id: bookingId,
      });
    }

    return bookingId;
  }

  static async updateStatus(booking_id, status) {
    await pool.query('UPDATE booking SET status = ? WHERE booking_id = ?', [status, booking_id]);
  }
}

module.exports = Booking;