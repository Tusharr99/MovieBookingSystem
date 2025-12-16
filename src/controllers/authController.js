const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role: role === 'admin' ? 'admin' : 'user' });
    const token = signToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim();
    const password = req.body.password || '';
    let user = await User.findOne({ email });

    // Admin override path: require ADMIN_PASSWORD and exact ADMIN_EMAIL match
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && email === process.env.ADMIN_EMAIL) {
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(400).json({ message: 'Invalid password for admin' });
      }
      if (!user) {
        user = await User.create({
          name: 'Admin',
          email,
          password: process.env.ADMIN_PASSWORD,
          role: 'admin'
        });
      } else {
        // force role + password to match env
        user.role = 'admin';
        user.password = process.env.ADMIN_PASSWORD;
        await user.save();
      }
    } else {
      // Normal user path
      if (!user) return res.status(400).json({ message: 'Email not found' });
      const match = await user.comparePassword(password);
      if (!match) return res.status(400).json({ message: 'Wrong password' });
    }

    const token = signToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

module.exports = { register, login, me, logout };

