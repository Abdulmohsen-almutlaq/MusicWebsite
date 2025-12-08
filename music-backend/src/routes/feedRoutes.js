const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const auth = require('../middleware/auth');
const { likeLimiter, commentLimiter, playLimiter } = require('../middleware/rateLimiters');

// All feed actions require auth
router.use(auth);

router.get('/', feedController.getFeed); // The main "Activity Feed"

// Engagement Routes
router.post('/tracks/:id/like', likeLimiter, feedController.likeTrack);
router.delete('/tracks/:id/like', likeLimiter, feedController.unlikeTrack);
router.post('/tracks/:id/comments', commentLimiter, feedController.addComment);
router.get('/tracks/:id/comments', feedController.getComments);
router.post('/tracks/:id/play', playLimiter, feedController.playTrack);

module.exports = router;
