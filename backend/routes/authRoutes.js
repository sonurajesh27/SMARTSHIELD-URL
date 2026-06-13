const express = require('express');
const router = express.Router();
const { signup, login, getMe, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', validateSignup, signup);
router.post('/register', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (require valid JWT)
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
