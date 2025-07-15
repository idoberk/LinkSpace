const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authenticate = require('../middleware/authMiddleware');
const { canViewPost } = require('../middleware/postMiddleware');
const {
	canEditComment,
	canDeleteComment,
	validateParentComment,
} = require('../middleware/commentMiddleware');

router.get('/', commentController.getAllComments);

router.use(authenticate);

router.get('/post/:id', canViewPost, commentController.getPostComments);

router.get('/:id', commentController.getComment);

router.post(
	'/:id',
	canViewPost,
	validateParentComment,
	commentController.createComment,
);

router.put('/:id', canEditComment, commentController.updateComment);

router.delete('/:id', canDeleteComment, commentController.deleteComment);

router.post('/:id/like', commentController.likeComment);

module.exports = router;
