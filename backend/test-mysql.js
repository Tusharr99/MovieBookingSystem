const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('Connected to MySQL as', process.env.DB_USER);
    const [result] = await connection.query('SELECT 1 + 1 AS solution');
    console.log('Test query result:', result[0].solution);
    await connection.end();
  } catch (err) {
    console.error('Connection error:', err.message);
    console.error('Error details:', err);
  }
}

testConnection();