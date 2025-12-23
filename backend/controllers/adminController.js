const Movie = require('../models/Movie');
const Screening = require('../models/Screening');
const Theatre = require('../models/Theatre');
const pool = require('../config/db');

exports.addMovie = async (req, res) => {
  const { title, genre, duration, image_url, screenings } = req.body;
  console.log('Adding movie:', { title, genre, duration, image_url, screenings });
  try {
    // Validate movie fields
    if (!title || !genre || !duration) {
      return res.status(400).json({ error: 'Title, genre, and duration are required' });
    }
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({ error: 'Duration must be a positive number' });
    }

    // Validate screenings
    if (screenings && screenings.length > 0) {
      for (const { theatre_id, show_time } of screenings) {
        if (!theatre_id || !show_time) {
          return res.status(400).json({ error: 'Each screening must have a theatre_id and show_time' });
        }
        // Verify theatre exists
        const [theatreCheck] = await pool.query('SELECT 1 FROM Theatre WHERE theatre_id = ?', [
          theatre_id,
        ]);
        if (theatreCheck.length === 0) {
          return res.status(400).json({ error: `Theatre ID ${theatre_id} does not exist` });
        }
        // Validate show_time format
        if (isNaN(Date.parse(show_time))) {
          return res.status(400).json({ error: `Invalid show_time: ${show_time}` });
        }
      }
    }

    const movieId = await Movie.create({ title, genre, duration, image_url });
    if (screenings && screenings.length > 0) {
      await Screening.createBulk(movieId, screenings);
    }
    console.log('Movie created:', movieId);
    res.json({ movieId });
  } catch (error) {
    console.error('Add movie error:', error.message, error.stack);
    res.status(500).json({ error: `Failed to add movie: ${error.message}` });
  }
};

exports.deleteMovie = async (req, res) => {
  const { movie_id } = req.params;
  console.log('Deleting movie:', movie_id);
  try {
    await Movie.delete(movie_id);
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Delete movie error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getTheatres = async (req, res) => {
  console.log('Fetching theatres');
  try {
    const theatres = await Theatre.findAll();
    res.json(theatres);
  } catch (error) {
    console.error('Fetch theatres error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.addTheatre = async (req, res) => {
  const { name, location } = req.body;
  console.log('Adding theatre:', { name, location });
  try {
    if (!name || !location) {
      return res.status(400).json({ error: 'Name and location are required' });
    }
    const theatreId = await Theatre.create({ name, location });
    console.log('Theatre created:', theatreId);
    res.json({ theatreId });
  } catch (error) {
    console.error('Add theatre error:', error.message, error.stack);
    res.status(500).json({ error: `Failed to add theatre: ${error.message}` });
  }
};

exports.deleteTheatre = async (req, res) => {
  const { theatre_id } = req.params;
  console.log('Deleting theatre:', theatre_id);
  try {
    await Theatre.delete(theatre_id);
    res.json({ message: 'Theatre deleted successfully' });
  } catch (error) {
    console.error('Delete theatre error:', error.message);
    res.status(500).json({ error: error.message });
  }
};