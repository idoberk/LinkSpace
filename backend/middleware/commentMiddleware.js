const Comment = require('../models/Comment');
const createValidationMiddleware = require('./validationMiddleware');
const { TIME_ALLOWED_TO_EDIT, MAX_DEPTH } = require('../utils/constants');
const { convertMsToMinutes } = require('../utils/timeFormatting');

const commentValidation = createValidationMiddleware(Comment, {
	notFoundMessage: 'Comment not found',
	itemName: 'comment',
	authorField: 'author',
});

const canEditComment = commentValidation.checkCanEdit(
	'id',
	`Comment can no longer be edited (${convertMsToMinutes(
		TIME_ALLOWED_TO_EDIT,
	)} minutes limit exceeded)`,
);
const canDeleteComment = commentValidation.checkCanDelete('id');

const validateParentComment = async (req, res, next) => {
	try {
		const { parentCommentId } = req.body;
		const postId = req.params.id;
		if (!parentCommentId) return next(); // No parent, nothing to check

		const parentComment = await Comment.findById(parentCommentId);
		if (!parentComment) {
			return res.status(404).json({ error: 'Parent comment not found' });
		}
		if (parentComment.post.toString() !== postId) {
			return res
				.status(400)
				.json({ error: 'Parent comment does not belong to this post' });
		}
		if (parentComment.isDeleted) {
			return res
				.status(400)
				.json({ error: 'Cannot reply to a deleted comment' });
		}
		if (parentComment.depth + 1 > MAX_DEPTH) {
			return res
				.status(400)
				.json({ error: 'Maximum comment nesting depth reached' });
		}

		req.parentComment = parentComment;
		next();
	} catch (error) {
		next(error);
	}
};

module.exports = { canEditComment, canDeleteComment, validateParentComment };
