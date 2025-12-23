// backend/routes/theatreRoutes.js
const express = require('express');
const router = express.Router();
const theatreController = require('../controllers/theatreController');

router.get('/', theatreController.getTheatres);

module.exports = router;