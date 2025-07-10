const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const {
	isGroupMember,
	isGroupAdmin,
	isGroupCreator,
} = require('../middleware/groupMiddleware');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { handleUploadErrors } = require('../middleware/errorHandler');

router.get('/', groupController.searchGroups);
router.get('/:id', groupController.getGroupById);
router.get('/:id/stats', groupController.getGroupStats);

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
router.get(
	'/:id/pending-requests',
	authenticate,
	isGroupAdmin,
	groupController.getPendingRequests,
);

router.post(
	'/:id/approve-request',
	authenticate,
	isGroupAdmin,
	groupController.approveJoinRequest,
);

router.post(
	'/:id/reject-request',
	authenticate,
	isGroupAdmin,
	groupController.rejectJoinRequest,
);

router.delete(
	'/:id/members/:userId',
	authenticate,
	isGroupAdmin,
	groupController.removeGroupMember,
);

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

router.delete(
	'/:id/posts/:postId',
	authenticate,
	isGroupAdmin,
	groupController.deleteGroupPost,
);

module.exports = router;
