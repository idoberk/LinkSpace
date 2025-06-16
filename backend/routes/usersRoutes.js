const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', userController.getAllUsers);
router.get('/search', optionalAuth, userController.searchUser);
router.get('/:id', optionalAuth, userController.getUserById);

router.post(
	'/:id/friend-request',
	authenticate,
	userController.sendFriendRequest,
);
router.post(
	'/:id/accept-friend',
	authenticate,
	userController.acceptFriendRequest,
);
router.post(
	'/:id/reject-friend',
	authenticate,
	userController.rejectFriendRequest,
);
router.delete('/:id/remove-friend', authenticate, userController.removeFriend);

module.exports = router;
