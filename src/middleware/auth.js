const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const bearer = req.headers.authorization;
  const token = req.cookies?.token || (bearer && bearer.startsWith('Bearer ') ? bearer.split(' ')[1] : null);

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const roles = (...allowed) => (req, res, next) => {
  if (!req.user || !allowed.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

module.exports = { auth, roles };

