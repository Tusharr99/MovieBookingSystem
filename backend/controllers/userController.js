const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });
  try {
    const [users] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
    if (users.length === 0) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = users[0];

    // Check password (plaintext or hashed)
    let isMatch = false;
    if (user.password.startsWith('$2a$')) {
      // Hashed password (bcrypt)
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Plaintext (for testing)
      isMatch = user.password === password;
    }

    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.user_id, isAdmin: false },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );
    console.log('Generated token for user_id:', user.user_id);
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to login' });
  }
};

exports.register = async (req, res) => {
  const { email, password } = req.body;
  console.log('Register attempt:', { email });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO User (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    console.log('User registered:', { user_id: result.insertId });
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ error: 'Failed to register' });
  }
};