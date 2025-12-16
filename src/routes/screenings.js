const express = require('express');
const { listScreenings, createScreening, updateScreening, deleteScreening } = require('../controllers/screeningController');
const { auth, roles } = require('../middleware/auth');

const router = express.Router();

router.get('/', listScreenings);
router.post('/', auth, roles('admin'), createScreening);
router.put('/:id', auth, roles('admin'), updateScreening);
router.delete('/:id', auth, roles('admin'), deleteScreening);

module.exports = router;

