const express = require('express');
const { listTheatres, createTheatre, updateTheatre, deleteTheatre } = require('../controllers/theatreController');
const { auth, roles } = require('../middleware/auth');

const router = express.Router();

router.get('/', listTheatres);
router.post('/', auth, roles('admin'), createTheatre);
router.put('/:id', auth, roles('admin'), updateTheatre);
router.delete('/:id', auth, roles('admin'), deleteTheatre);

module.exports = router;

