const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

// Security: Rate Limiter for Auth Routes
// Limits to 100 requests per 15 minutes per IP to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many login/register attempts, please try again after 15 minutes' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const checkAuth = require('../middleware/checkAuth');

// Apply limiter to login and register
router.post('/register', authLimiter, authController.register);
router.get('/verify', authController.verify); 
router.post('/login', authLimiter, authController.login);

// Protected Routes
router.put('/password', checkAuth, authController.changePassword);
router.put('/profile', checkAuth, authController.updateProfile);
router.delete('/account', checkAuth, authController.deleteAccount);

// Endpoint to validate the Site Password (UI can call this to check if the password is correct)
router.post('/check-site-access', authController.checkSiteAccess);

module.exports = router;
