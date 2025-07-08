const pool = require('../config/db');

class Screening {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM screening');
    return rows;
  }

  static async findById(screening_id) {
    const [rows] = await pool.query(
      `SELECT s.screening_id, s.movie_id, s.theatre_id, s.show_time,
              m.title AS movie_title, t.name AS theatre_name, t.location AS theatre_location
       FROM screening s
       JOIN movie m ON s.movie_id = m.movie_id
       JOIN theatre t ON s.theatre_id = t.theatre_id
       WHERE s.screening_id = ?`,
      [screening_id]
    );
    return rows[0];
  }

  static async create({ movie_id, theatre_id, show_time }) {
    const [result] = await pool.query(
      'INSERT INTO screening (movie_id, theatre_id, show_time) VALUES (?, ?, ?)',
      [movie_id, theatre_id, show_time]
    );
    return result.insertId;
  }

  static async createBulk(movie_id, screenings) {
    const values = screenings.map(({ theatre_id, show_time }) => [
      movie_id,
      theatre_id,
      show_time,
    ]);
    await pool.query(
      'INSERT INTO screening (movie_id, theatre_id, show_time) VALUES ?',
      [values]
    );
  }
}

module.exports = Screening;