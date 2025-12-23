const pool = require('../config/db');

class Payment {
  static async create({ booking_id, amount, transaction_id }) {
    const [result] = await pool.query(
      'INSERT INTO payment (booking_id, amount, status, transaction_id) VALUES (?, ?, ?, ?)',
      [booking_id, amount, 'pending', transaction_id]
    );
    return result.insertId;
  }

  static async updateStatus(payment_id, status) {
    await pool.query('UPDATE payment SET status = ? WHERE payment_id = ?', [status, payment_id]);
  }
}

module.exports = Payment;