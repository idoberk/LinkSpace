const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const {
	isGroupMember,
	isGroupAdmin,
	isGroupCreator,
	canViewGroup,
} = require('../middleware/groupMiddleware');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { handleUploadErrors } = require('../middleware/errorHandler');

router.get('/', groupController.searchGroups);
router.get('/:id', groupController.getGroupById);
router.get(
	'/:id/stats',
	authenticate,
	isGroupAdmin,
	groupController.getGroupStats,
);

router.post(
	'/',
	authenticate,
	uploadSingle('coverImage'),
	handleUploadErrors,
	groupController.createGroup,
);

router.put(
	'/:id',
	authenticate,
	isGroupAdmin,
	uploadSingle('coverImage'),
	handleUploadErrors,
	groupController.updateGroup,
);

router.delete(
	'/:id',
	authenticate,
	isGroupCreator,
	groupController.deleteGroup,
);

router.post('/:id/join', authenticate, groupController.joinGroup);

router.post(
	'/:id/leave',
	authenticate,
	isGroupMember,
	groupController.leaveGroup,
);

// Member management
router.get(
	'/:id/members/pending-requests',
	authenticate,
	isGroupAdmin,
	groupController.getPendingMembers,
);

router.post(
	'/:id/members/:userId/request',
	authenticate,
	isGroupAdmin,
	groupController.handleJoinRequest,
);

router.delete(
	'/:id/members/:userId',
	authenticate,
	isGroupAdmin,
	groupController.removeGroupMember,
);

// Ban management (Admins only)
router.post('/:id/ban', authenticate, isGroupAdmin, groupController.banUser);
router.get(
	'/:id/bans',
	authenticate,
	isGroupAdmin,
	groupController.getBannedUsers,
);

// Membership History
router.get(
	'/:id/history',
	authenticate,
	isGroupAdmin,
	groupController.getMembershipHistory,
);

// Admin management
router.post(
	'/:id/admins/:userId',
	authenticate,
	isGroupAdmin,
	groupController.promoteToGroupAdmin,
);
router.delete(
	'/:id/admins/:userId',
	authenticate,
	isGroupAdmin,
	groupController.demoteGroupAdmin,
);

// Group post management (Admins only)
router.delete(
	'/:id/posts/:postId',
	authenticate,
	isGroupAdmin,
	groupController.deleteGroupPost,
);

module.exports = router;
