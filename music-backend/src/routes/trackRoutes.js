const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// Public Routes
router.get('/search', trackController.searchTracks); // Search tracks
router.get('/public', trackController.getPublicTracks); // Get all public tracks (Feed)
router.get('/trending', trackController.getTrendingTracks);
router.get('/top-rated', trackController.getTopRatedTracks);
router.get('/user/:userId', trackController.getUserTracks); // Get specific user's public tracks
router.get('/stream/:trackId', trackController.streamTrack);
router.get('/', trackController.getAllTracks); // This might need to be filtered or admin only? Keeping as is for now.

// Protected Routes
router.get('/me', auth, trackController.getMyTracks); // Get MY tracks (all)
router.post('/', auth, upload.fields([{ name: 'track', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), trackController.uploadTrack);
router.patch('/:id/visibility', auth, trackController.toggleVisibility);
router.delete('/:id', auth, trackController.deleteTrack);

module.exports = router;
