const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authMiddleware');

// Public search endpoint (no authentication required)
router.get('/search', userController.searchUser);

router.use(authenticate);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

router.post('/:id/friend-request', userController.sendFriendRequest);
router.post('/:id/accept-friend', userController.acceptFriendRequest);
router.post('/:id/reject-friend', userController.rejectFriendRequest);
router.delete('/:id/remove-friend', userController.removeFriend);

module.exports = router;
