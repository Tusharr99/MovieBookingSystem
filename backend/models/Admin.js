const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class Admin {
  static async create({ email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO admin (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM admin WHERE email = ?', [email]);
    return rows[0];
  }
}

module.exports = Admin;