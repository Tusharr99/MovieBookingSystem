const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const screeningRoutes = require('./routes/screeningRoutes');
const theatreRoutes = require('./routes/theatreRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

db.getConnection()
  .then(() => console.log('MySQL connected'))
  .catch(err => {
    console.error('MySQL connection error:', err);
    process.exit(1);
  });

app.use(cors());
app.use(express.json()); // Ensure this line exists

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/screenings', screeningRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Movie Booking API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));