const express = require('express');
const router = express.Router();
const { createUrl, getAllUrls, updateUrl, deleteUrl, bulkCreateUrls, getPublicStats } = require('../controllers/urlController');
const { protect } = require('../middleware/authMiddleware');
const { validateUrlCreate } = require('../middleware/validateMiddleware');
const { urlCreateLimiter } = require('../middleware/rateLimitMiddleware');

// Route configurations (all protected by JWT auth)
router.post('/create', protect, urlCreateLimiter, validateUrlCreate, createUrl);
router.post('/bulk', protect, bulkCreateUrls);
router.get('/stats/:shortCode', getPublicStats); // Public endpoint
router.get('/all', protect, getAllUrls);
router.put('/:id', protect, updateUrl);
router.delete('/:id', protect, deleteUrl);

module.exports = router;
