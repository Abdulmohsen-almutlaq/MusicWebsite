const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Access Control Routes (Must be before /:id to avoid conflict)
router.post('/request-access', auth, userController.requestUploadAccess);
router.get('/request-status', auth, userController.getAccessRequestStatus);
router.post('/approve-access', auth, userController.approveAccessRequest); 
router.get('/pending-requests', auth, userController.getAllPendingRequests);

// Public routes
router.get('/', userController.getAllUsers);
router.get('/search', userController.searchUsers);
router.get('/suggested', auth, userController.getSuggestedUsers); 
router.get('/:id', auth, userController.getProfile);
router.get('/:id/followers', userController.getFollowers);
router.get('/:id/following', userController.getFollowing);

// Protected routes
router.post('/:id/follow', auth, userController.followUser);
router.post('/:id/unfollow', auth, userController.unfollowUser);

module.exports = router;
