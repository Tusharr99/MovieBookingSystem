const pool = require('../config/db');

class Movie {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM movie');
    return rows;
  }

  static async create({ title, genre, duration, image_url }) {
    const [result] = await pool.query(
      'INSERT INTO movie (title, genre, duration, image_url) VALUES (?, ?, ?, ?)',
      [title, genre, duration, image_url || null]
    );
    return result.insertId;
  }

  static async delete(movie_id) {
    const connection = await pool.getConnection();
    try {
      console.log(`Starting deletion for movie_id: ${movie_id}`);
      await connection.beginTransaction();

      // Verify movie exists
      const [movieCheck] = await connection.query('SELECT 1 FROM movie WHERE movie_id = ?', [
        movie_id,
      ]);
      if (movieCheck.length === 0) {
        console.log(`Movie_id ${movie_id} not found`);
        throw new Error('Movie not found');
      }

      // Find all screenings
      const [screenings] = await connection.query(
        'SELECT screening_id FROM screening WHERE movie_id = ?',
        [movie_id]
      );
      const screeningIds = screenings.map((s) => s.screening_id);
      console.log(`Found ${screeningIds.length} screenings: ${screeningIds}`);

      if (screeningIds.length > 0) {
        // Delete related payments
        console.log('Deleting related payments');
        await connection.query(
          'DELETE p FROM payment p JOIN booking b ON p.booking_id = b.booking_id WHERE b.screening_id IN (?)',
          [screeningIds]
        );

        // Delete related booked seats
        console.log('Deleting related booked seats');
        await connection.query(
          'DELETE bs FROM booked_seat bs JOIN booking b ON bs.booking_id = b.booking_id WHERE b.screening_id IN (?)',
          [screeningIds]
        );

        // Delete related bookings
        console.log('Deleting related bookings');
        await connection.query('DELETE FROM booking WHERE screening_id IN (?)', [
          screeningIds,
        ]);

        // Delete screenings
        console.log('Deleting screenings');
        await connection.query('DELETE FROM screening WHERE movie_id = ?', [movie_id]);
      }

      // Delete the movie
      console.log('Deleting movie');
      const [deleteResult] = await connection.query('DELETE FROM movie WHERE movie_id = ?', [
        movie_id,
      ]);
      console.log(`Movie deletion result: ${deleteResult.affectedRows} rows affected`);

      await connection.commit();
      console.log(`Successfully deleted movie_id: ${movie_id}`);
    } catch (error) {
      console.error(`Error deleting movie_id ${movie_id}:`, error.message, error.stack);
      await connection.rollback();
      throw new Error(`Failed to delete movie: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}

module.exports = Movie;