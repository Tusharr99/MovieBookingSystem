// Basic error handler to avoid repeating try/catch in routes
const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Server error';
  if (req.accepts('html')) {
    return res.status(status).render('pages/error', { title: 'Error', message, status });
  }
  res.status(status).json({ message });
};

module.exports = errorHandler;

