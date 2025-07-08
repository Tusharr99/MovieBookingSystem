const pool = require('../config/db');

class Theatre {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM theatre');
    return rows;
  }

  static async create({ name, location }) {
    console.log('Creating theatre:', { name, location });
    const [result] = await pool.query(
      'INSERT INTO theatre (name, location) VALUES (?, ?)',
      [name, location]
    );
    return result.insertId;
  }

  static async delete(theatre_id) {
    const connection = await pool.getConnection();
    try {
      console.log(`Starting deletion for theatre_id: ${theatre_id}`);
      await connection.beginTransaction();

      // Verify theatre exists
      const [theatreCheck] = await connection.query(
        'SELECT 1 FROM theatre WHERE theatre_id = ?',
        [theatre_id]
      );
      if (theatreCheck.length === 0) {
        console.log(`Theatre_id ${theatre_id} not found`);
        throw new Error('Theatre not found');
      }

      // Find all screenings for the theatre
      const [screenings] = await connection.query(
        'SELECT screening_id FROM screening WHERE theatre_id = ?',
        [theatre_id]
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
        await connection.query('DELETE FROM screening WHERE theatre_id = ?', [theatre_id]);
      }

      // Delete the theatre
      console.log('Deleting theatre');
      const [deleteResult] = await connection.query(
        'DELETE FROM theatre WHERE theatre_id = ?',
        [theatre_id]
      );
      console.log(`Theatre deletion result: ${deleteResult.affectedRows} rows affected`);

      await connection.commit();
      console.log(`Successfully deleted theatre_id: ${theatre_id}`);
    } catch (error) {
      console.error(`Error deleting theatre_id ${theatre_id}:`, error.message, error.stack);
      await connection.rollback();
      throw new Error(`Failed to delete theatre: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}

module.exports = Theatre;