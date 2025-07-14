const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const {
	isGroupMember,
	isGroupAdmin,
	isGroupCreator,
	isNotBanned,
	isNotMember,
	isPendingMember,
	isTargetGroupMember,
} = require('../middleware/groupMiddleware');
const authenticate = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { handleUploadErrors } = require('../middleware/errorHandler');

router.get('/:id/public-stats', groupController.getGroupStatsPublic);
router.use(authenticate);

router.get('/', groupController.searchGroups);
router.get('/:id', groupController.getGroupById);
router.get('/:id/stats', isGroupAdmin, groupController.getGroupStats);

router.post(
	'/',
	uploadSingle('coverImage'),
	handleUploadErrors,
	groupController.createGroup,
);

router.put(
	'/:id',
	isGroupAdmin,
	uploadSingle('coverImage'),
	handleUploadErrors,
	groupController.updateGroup,
);

router.delete('/:id', isGroupCreator, groupController.deleteGroup);

router.post(
	'/:id/join',
	isNotBanned,
	isNotMember,
	isPendingMember,
	groupController.joinGroup,
);

router.post('/:id/leave', isGroupMember, groupController.leaveGroup);

// Member management
router.get(
	'/:id/members/pending-requests',
	isGroupAdmin,
	groupController.getPendingMembers,
);

router.post(
	'/:id/members/:userId/request',
	isGroupAdmin,
	groupController.handleJoinRequest,
);

router.delete(
	'/:id/members/:userId',
	isGroupAdmin,
	isTargetGroupMember,
	groupController.removeGroupMember,
);

// Ban management (Admins only)
router.post('/:id/ban', isGroupAdmin, groupController.banUser);
router.get('/:id/bans', isGroupAdmin, groupController.getBannedUsers);

// Membership History
router.get('/:id/history', isGroupAdmin, groupController.getMembershipHistory);

// Admin management
router.post(
	'/:id/admins/:userId',
	isGroupAdmin,
	isTargetGroupMember,
	groupController.promoteToGroupAdmin,
);
router.delete(
	'/:id/admins/:userId',
	isGroupAdmin,
	isTargetGroupMember,
	groupController.demoteGroupAdmin,
);

// Group post management (Admins only)
router.delete(
	'/:id/posts/:postId',
	isGroupAdmin,
	groupController.deleteGroupPost,
);

module.exports = router;
