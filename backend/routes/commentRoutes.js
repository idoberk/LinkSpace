const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/authMiddleware');
const { canViewPost } = require('../middleware/postMiddleware');
const {
	canEditComment,
	canDeleteComment,
} = require('../middleware/commentMiddleware');

// Get all comments for statistics (no authentication required)
router.get('/', commentController.getAllComments);

router.get(
	'/post/:id',
	authenticate,
	canViewPost,
	commentController.getPostComments,
);

router.get('/:id', authenticate, commentController.getComment);

router.post('/:id', authenticate, canViewPost, commentController.createComment);

router.put(
	'/:id',
	authenticate,
	canEditComment,
	commentController.updateComment,
);

router.delete(
	'/:id',
	authenticate,
	canDeleteComment,
	commentController.deleteComment,
);

router.post('/:id/like', authenticate, commentController.likeComment);

module.exports = router;
