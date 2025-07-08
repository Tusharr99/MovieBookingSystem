const pool = require('../config/db');

class BookedSeat {
  static async create({ screening_id, seat_number, booking_id }) {
    const [result] = await pool.query(
      'INSERT INTO booked_seat (screening_id, seat_number, booking_id) VALUES (?, ?, ?)',
      [screening_id, seat_number, booking_id]
    );
    return result.insertId;
  }

  static async findByScreening(screening_id) {
    const [rows] = await pool.query(
      'SELECT seat_number FROM booked_seat WHERE screening_id = ?',
      [screening_id]
    );
    return rows.map(row => row.seat_number);
  }
}

module.exports = BookedSeat;