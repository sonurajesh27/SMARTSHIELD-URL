const express = require('express');
const router = express.Router();
const { getUrlAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Route configurations (protected)
router.get('/:id', protect, getUrlAnalytics);

module.exports = router;
