const pool = require('../config/db');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
    return rows[0];
  }

  static async create({ name, email, password }) {
    const [result] = await pool.query(
      'INSERT INTO user (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    return result.insertId;
  }
}

module.exports = User;