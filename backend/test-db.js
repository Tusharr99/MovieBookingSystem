const pool = require('./config/db');
async function test() {
  try {
    const [results] = await pool.query('SELECT 1 + 1 AS solution');
    console.log('Database test query result:', results[0].solution);
  } catch (err) {
    console.error('Connection error:', err.message);
    console.error('Error details:', err);
  }
}
test();