const express = require('express');
const { listMovies, getMovie, createMovie, updateMovie, deleteMovie } = require('../controllers/movieController');
const { auth, roles } = require('../middleware/auth');

const router = express.Router();

router.get('/', listMovies);
router.get('/:id', getMovie);
router.post('/', auth, roles('admin'), createMovie);
router.put('/:id', auth, roles('admin'), updateMovie);
router.delete('/:id', auth, roles('admin'), deleteMovie);

module.exports = router;

