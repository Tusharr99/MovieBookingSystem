require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const movieRoutes = require('./routes/movies');
const authRoutes = require('./routes/auth');
const theatreRoutes = require('./routes/theatres');
const screeningRoutes = require('./routes/screenings');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const Movie = require('./models/Movie');
const Theatre = require('./models/Theatre');
const Screening = require('./models/Screening');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect database
connectDB().catch((err) => {
  console.error('Mongo connection failed', err);
  process.exit(1);
});

// Seed admin if configured
const ensureAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return;
  const existing = await User.findOne({ email: adminEmail });
  if (existing) return;
  await User.create({ name: 'Admin', email: adminEmail, password: adminPassword, role: 'admin' });
  console.log('✅ Admin user seeded');
};

ensureAdminUser().catch((err) => console.error('Admin seed failed', err));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/screenings', screeningRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// Extract user from token for view rendering (non-blocking)
const getUserFromToken = (req) => {
  try {
    const token = req.cookies?.token;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Ensure configured admin email is always treated as admin in views
    if (process.env.ADMIN_EMAIL && decoded.email === process.env.ADMIN_EMAIL) {
      decoded.role = 'admin';
    }
    return decoded;
  } catch (err) {
    return null;
  }
};

// Simple EJS pages
app.get('/', async (req, res, next) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 }).limit(12);
    const screenings = await Screening.find()
      .populate('movie theatre')
      .sort({ startTime: 1 })
      .limit(50);
    const user = getUserFromToken(req);
    res.render('pages/home', { title: 'Movies', movies, user, screenings });
  } catch (err) {
    next(err);
  }
});

const renderBookPage = async (req, res, next) => {
  try {
    const user = getUserFromToken(req);
    const movieId = req.params.movieId || null;
    const filter = movieId ? { movie: movieId } : {};
    const screenings = await Screening.find(filter)
      .populate('movie theatre')
      .sort({ startTime: 1 });
    const seatRows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seatsPerRow = 10;
    res.render('pages/book', { title: 'Book Tickets', user, screenings, seatRows, seatsPerRow, movieId });
  } catch (err) {
    next(err);
  }
};

app.get('/book', renderBookPage);
app.get('/book/:movieId', renderBookPage);

app.post('/payment', async (req, res, next) => {
  try {
    const user = getUserFromToken(req);
    const { screeningId, seatsCsv } = req.body;
    const seats = (seatsCsv || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!screeningId || seats.length === 0) {
      return res.status(400).render('pages/error', {
        title: 'Booking error',
        status: 400,
        message: 'Select a screening and at least one seat.'
      });
    }

    const screening = await Screening.findById(screeningId).populate('movie theatre');
    if (!screening) {
      return res.status(404).render('pages/error', { title: 'Not found', status: 404, message: 'Screening not found' });
    }

    const total = seats.length * screening.price;
    res.render('pages/payment', { title: 'Payment', user, screening, seats, total });
  } catch (err) {
    next(err);
  }
});

app.get('/movies/:id', async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).render('pages/error', { title: 'Not found', message: 'Movie not found', status: 404 });
    const screenings = await Screening.find({ movie: movie._id })
      .populate('theatre')
      .sort({ startTime: 1 });
    const reviews = await Review.find({ movie: movie._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    const avgRating =
      reviews.length === 0
        ? 0
        : Math.round((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length) * 10) / 10;
    const user = getUserFromToken(req);
    res.render('pages/movie', { title: movie.title, user, movie, screenings, reviews, avgRating });
  } catch (err) {
    next(err);
  }
});

app.get('/ticket/:id', async (req, res, next) => {
  try {
    const user = getUserFromToken(req);
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'screening', populate: [{ path: 'movie' }, { path: 'theatre' }] });
    if (!booking) return res.status(404).render('pages/error', { title: 'Not found', message: 'Ticket not found', status: 404 });
    res.render('pages/ticket', { title: 'Your Ticket', user, booking });
  } catch (err) {
    next(err);
  }
});

app.get('/bookings', async (req, res, next) => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).render('pages/error', { title: 'Unauthorized', status: 401, message: 'Please log in to view bookings' });
    }
    const filter = user.role === 'admin' ? {} : { user: user.id };
    const bookings = await Booking.find(filter)
      .populate({ path: 'screening', populate: [{ path: 'movie' }, { path: 'theatre' }] })
      .sort({ createdAt: -1 });
    res.render('pages/bookings', { title: 'My Bookings', user, bookings });
  } catch (err) {
    next(err);
  }
});

app.get('/login', (req, res) => res.render('pages/login', { title: 'Login' }));
app.get('/register', (req, res) => res.render('pages/register', { title: 'Register' }));

app.get('/admin', async (req, res, next) => {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).render('pages/error', { title: 'Forbidden', message: 'Admin only', status: 403 });
    }
    const [movies, theatres, screenings, users, reviews, reviewStats] = await Promise.all([
      Movie.find().sort({ createdAt: -1 }),
      Theatre.find().sort({ createdAt: -1 }),
      Screening.find().populate('movie theatre').sort({ startTime: 1 }),
      User.find().sort({ createdAt: -1 }),
      Review.find().populate('movie user').sort({ createdAt: -1 }),
      Review.aggregate([{ $group: { _id: '$movie', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }])
    ]);
    const reviewStatsMap = reviewStats.reduce((acc, r) => {
      if (!r._id) return acc;
      acc[r._id.toString()] = r;
      return acc;
    }, {});
    const totalReviewCount = reviewStats.reduce((sum, r) => sum + (r.count || 0), 0);
    const weightedRatings = reviewStats.reduce((sum, r) => sum + (r.avgRating || 0) * (r.count || 0), 0);
    const overallAvgRating = totalReviewCount ? Math.round((weightedRatings / totalReviewCount) * 10) / 10 : 0;

    res.render('pages/admin', {
      title: 'Admin Dashboard',
      user,
      movies,
      theatres,
      screenings,
      users,
      reviews,
      reviewStatsMap,
      overallAvgRating,
      totalReviewCount
    });
  } catch (err) {
    next(err);
  }
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

