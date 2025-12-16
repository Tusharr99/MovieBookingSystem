const express = require('express');
const { listReviews, createReview } = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listReviews);
router.post('/', auth, createReview);

module.exports = router;

