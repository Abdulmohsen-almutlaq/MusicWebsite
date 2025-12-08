const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', userController.getAllUsers);
router.get('/search', userController.searchUsers);
router.get('/suggested', auth, userController.getSuggestedUsers); // New route
router.get('/:id', auth, userController.getProfile);
router.get('/:id/followers', userController.getFollowers);
router.get('/:id/following', userController.getFollowing);

// Protected routes
router.post('/:id/follow', auth, userController.followUser);
router.post('/:id/unfollow', auth, userController.unfollowUser);

module.exports = router;
